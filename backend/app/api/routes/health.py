from fastapi import APIRouter, HTTPException, status
from app.ml.model_loader import get_model, get_glcm_dim

router = APIRouter()

@router.get("/health")
def get_health():
    """Check general backend health status."""
    return {
        "status": "UP",
        "service": "Opti-Light Backend"
    }

@router.get("/health/model")
def get_model_health():
    """Verify if the ML model is loaded and ready for predictions."""
    model = get_model()
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is not loaded or is currently unavailable."
        )
    return {
        "status": "READY",
        "model_input_shapes": [str(inp.shape) for inp in model.inputs],
        "glcm_dimension": get_glcm_dim()
    }
