import os
import uuid
import cv2
import numpy as np
import datetime
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, List

from app.db.database import get_db
from app.db.models import User, Prediction
from app.api.routes.auth import get_current_user
from app.services.prediction_service import run_predictions_pipeline

router = APIRouter()
logger = logging.getLogger("opti_light")

# Target directory for uploaded images
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg"}

# Pydantic Schemas
class Probabilities(BaseModel):
    CNV: float = Field(..., ge=0.0, le=1.0)
    DME: float = Field(..., ge=0.0, le=1.0)
    DRUSEN: float = Field(..., ge=0.0, le=1.0)
    NORMAL: float = Field(..., ge=0.0, le=1.0)

class PredictionResponse(BaseModel):
    id: int = Field(..., description="Database record ID of this prediction")
    prediction: str
    confidence: float
    probabilities: Probabilities
    message: str
    disclaimer: str

class PredictionHistoryResponse(BaseModel):
    id: int
    image_name: str
    prediction: str
    confidence: float
    cnv_probability: float
    dme_probability: float
    drusen_probability: float
    normal_probability: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Routes
@router.post("/predictions", response_model=PredictionResponse)
async def predict_oct_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an OCT image file (.jpg, .jpeg, .png) to obtain the AI retinal disease prediction.
    Requires JWT authentication. Automatically logs prediction results to database.
    """
    # 1. Validate File Extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{file_ext}'. Allowed extensions are: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # 2. Validate MIME Type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media type '{file.content_type}'. Must be image/jpeg or image/png."
        )
        
    # 3. Read image bytes and validate size
    max_size = int(os.getenv("MAX_UPLOAD_SIZE", 5242880)) # 5MB default
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File is too large ({len(contents)} bytes). Max size allowed is {max_size} bytes."
        )
        
    # 4. Save file securely using UUID to prevent path traversal
    safe_filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(filepath, "wb") as f:
        f.write(contents)
        
    # 5. Decode image for OpenCV processing
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not decode image file. Please upload a valid image."
        )
        
    # 6. Execute ML Inference Pipeline
    try:
        results = run_predictions_pipeline(img_bgr)
        
        # 7. Log Prediction to Database
        db_prediction = Prediction(
            user_id=current_user.id,
            image_name=safe_filename,
            prediction=results["prediction"],
            confidence=results["confidence"],
            cnv_probability=results["probabilities"]["CNV"],
            dme_probability=results["probabilities"]["DME"],
            drusen_probability=results["probabilities"]["DRUSEN"],
            normal_probability=results["probabilities"]["NORMAL"]
        )
        
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        results["id"] = db_prediction.id
        
        return results
        
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline failure: {str(e)}"
        )

@router.get("/predictions/history", response_model=List[PredictionHistoryResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all predictions made by the authenticated user.
    Results are sorted chronologically in descending order.
    """
    predictions = db.query(Prediction)\
                    .filter(Prediction.user_id == current_user.id)\
                    .order_by(Prediction.created_at.desc())\
                    .all()
    return predictions

@router.get("/predictions/{prediction_id}", response_model=PredictionHistoryResponse)
def get_prediction_details(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details of a specific prediction.
    Strictly verifies ownership to prevent users from accessing records of other users.
    """
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )
        
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this prediction record."
        )
        
    return prediction

@router.delete("/predictions/{prediction_id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific prediction record.
    Strictly verifies ownership, and deletes the local image file associated with the prediction.
    """
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )
        
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cannot delete this prediction record."
        )
        
    # Attempt to remove image file from local uploads directory
    filepath = os.path.join(UPLOAD_DIR, prediction.image_name)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            logger.info(f"Successfully deleted local image file: {filepath}")
        except Exception as e:
            logger.error(f"Failed to delete local image file {filepath}: {e}")
            
    # Delete from database
    db.delete(prediction)
    db.commit()
    
    return {"message": "Prediction record and associated image file deleted successfully."}
