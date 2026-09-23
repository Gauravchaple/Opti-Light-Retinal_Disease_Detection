import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops

def extract_glcm_features(img_bgr, target_size=(224, 224), num_features=6):
    """
    Extract GLCM features from BGR image.
    Steps:
      1. Convert to grayscale.
      2. Resize to target size.
      3. Rescale to [0.0, 1.0].
      4. Scale back to 0-255 uint8 for graycomatrix (as in training).
      5. Compute GLCM for distances [1, 2, 3] and angles [0, pi/4, pi/2, 3pi/4].
      6. Calculate mean properties: contrast, dissimilarity, homogeneity, energy, correlation, ASM.
      7. (Optional) Calculate variance and entropy if num_features == 8.
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, target_size)
    normalized = resized.astype(np.float32) / 255.0
    
    # Scale to uint8 co-occurrence matrix expected range
    img_uint8 = (normalized * 255).astype(np.uint8)
    
    # Parameters matching the original pipeline
    distances = [1, 2, 3]
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    
    # Calculate co-occurrence matrix
    glcm = graycomatrix(img_uint8, distances=distances, angles=angles, symmetric=True, normed=True)
    
    # Standard properties (first 6 features)
    feature_names = ["contrast", "dissimilarity", "homogeneity", "energy", "correlation", "ASM"]
    features = [graycoprops(glcm, name).mean() for name in feature_names]
    
    if num_features == 8:
        # Calculate GLCM Variance
        variance = np.var(glcm)
        # Calculate GLCM Entropy (with small epsilon to prevent log2(0))
        entropy = -np.sum(glcm * np.log2(glcm + 1e-10))
        features.extend([variance, entropy])
        
    return np.array(features, dtype=np.float32)
