import numpy as np
import cv2
from app.ml.model_loader import get_model, get_scaler, get_glcm_dim
from app.ml.preprocessing import preprocess_for_resnet
from app.ml.glcm_extractor import extract_glcm_features

# Intended class mappings
CLASSES = ["CNV", "DME", "DRUSEN", "NORMAL"]
DISCLAIMER = "This result is intended for clinical decision support and is not a standalone medical diagnosis."

def run_predictions_pipeline(img_bgr: np.ndarray) -> dict:
    """
    Run the full image-to-prediction pipeline:
      OCT Image -> Preprocessing -> ResNet50 + GLCM -> Feature Fusion & Classification -> Formatted Response
    """
    # 1. Fetch loaded model assets
    model = get_model()
    scaler = get_scaler()
    glcm_dim = get_glcm_dim()
    
    if model is None:
        raise RuntimeError("ML Model is not loaded or is currently unavailable.")
        
    # 2. Preprocess image for ResNet50 input
    resnet_input = preprocess_for_resnet(img_bgr)
    
    # 3. Extract GLCM features dynamically
    glcm_feat = extract_glcm_features(img_bgr, num_features=glcm_dim)
    
    # 4. Scale GLCM features
    if scaler is not None:
        if glcm_dim <= len(scaler.mean_):
            scaled_feat = (glcm_feat - scaler.mean_[:glcm_dim]) / scaler.scale_[:glcm_dim]
            glcm_input = np.expand_dims(scaled_feat.astype(np.float32), axis=0)
        else:
            glcm_input = np.expand_dims(glcm_feat, axis=0)
    else:
        glcm_input = np.expand_dims(glcm_feat, axis=0)
        
    # 5. Run inference
    pred_probs = model.predict([resnet_input, glcm_input], verbose=0)[0]
    
    # 6. Format result
    pred_idx = int(np.argmax(pred_probs))
    prediction_label = CLASSES[pred_idx]
    confidence = float(pred_probs[pred_idx])
    
    probabilities = {CLASSES[i]: float(pred_probs[i]) for i in range(len(CLASSES))}
    
    return {
        "prediction": prediction_label,
        "confidence": confidence,
        "probabilities": probabilities,
        "message": "AI prediction generated successfully",
        "disclaimer": DISCLAIMER
    }
