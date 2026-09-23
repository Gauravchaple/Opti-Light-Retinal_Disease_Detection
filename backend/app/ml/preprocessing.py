import cv2
import numpy as np

def preprocess_for_resnet(img_bgr, target_size=(224, 224)):
    """
    Convert image from BGR (OpenCV format) to RGB, resize it,
    and normalize pixel values to [0.0, 1.0].
    Returns:
        np.ndarray: preprocessed image batch of shape (1, target_size, target_size, 3)
    """
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(img_rgb, target_size)
    normalized = resized.astype(np.float32) / 255.0
    return np.expand_dims(normalized, axis=0)
