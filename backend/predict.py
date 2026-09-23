import os
import sys
import numpy as np
import cv2

# Set TF logging level to reduce clutter
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf

# Register custom Cast layer for Keras 3 compatibility with mixed-precision checkpoints
@tf.keras.utils.register_keras_serializable(package="Custom")
class Cast(tf.keras.layers.Layer):
    def __init__(self, dtype="float32", **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(**kwargs)
        self.target_dtype = dtype
    def call(self, inputs):
        return tf.cast(inputs, self.target_dtype)
    def get_config(self):
        config = super().get_config()
        config.update({"dtype": self.target_dtype})
        return config

def preprocess_for_resnet(img_bgr, target_size=(224, 224)):
    """Convert BGR to RGB, resize, and normalize to [0, 1] range."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(img_rgb, target_size)
    normalized = resized.astype(np.float32) / 255.0
    return np.expand_dims(normalized, axis=0)

def extract_glcm_features(img_bgr, target_size=(224, 224), num_features=6):
    """Convert to grayscale, resize, normalize, and extract GLCM texture properties."""
    from skimage.feature import graycomatrix, graycoprops
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, target_size)
    normalized = resized.astype(np.float32) / 255.0
    
    # Scale back to 0-255 uint8 for graycomatrix as done in original extraction pipeline
    img_uint8 = (normalized * 255).astype(np.uint8)
    
    # original parameters: distances=[1, 2, 3], angles=[0, pi/4, pi/2, 3pi/4]
    distances = [1, 2, 3]
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    
    glcm = graycomatrix(img_uint8, distances=distances, angles=angles, symmetric=True, normed=True)
    
    # First 6 features
    feature_names = ["contrast", "dissimilarity", "homogeneity", "energy", "correlation", "ASM"]
    features = [graycoprops(glcm, name).mean() for name in feature_names]
    
    if num_features == 8:
        # Extra features: variance and entropy
        variance = np.var(glcm)
        entropy = -np.sum(glcm * np.log2(glcm + 1e-10))
        features.extend([variance, entropy])
        
    return np.array(features)

def main():
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_oct_image>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        sys.exit(1)
        
    model_path = os.path.join(os.path.dirname(__file__), "model", "best_model.h5")
    if not os.path.exists(model_path):
        # Fallback to model directory in parent workspace
        model_path = os.path.join(os.path.dirname(__file__), "model", "checkpoint_epoch_21.keras")
        if not os.path.exists(model_path):
            print(f"Error: Model file not found in model directory.")
            sys.exit(1)
            
    print(f"Loading model from {model_path}...")
    try:
        model = tf.keras.models.load_model(model_path, custom_objects={"Cast": Cast}, compile=False)
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(1)
        
    # Auto-detect GLCM input feature dimension
    glcm_input_shape = model.inputs[1].shape[1]
    print(f"Detected model GLCM input shape: {glcm_input_shape}")
    
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: OpenCV could not read the image at {image_path}")
        sys.exit(1)
        
    # Preprocess image for ResNet50
    resnet_input = preprocess_for_resnet(img)
    
    # Extract GLCM features
    glcm_feat = extract_glcm_features(img, num_features=glcm_input_shape)
    
    scaler_path = os.path.join(os.path.dirname(__file__), "model", "saved_scaler.pkl")
    if os.path.exists(scaler_path):
        import joblib
        scaler = joblib.load(scaler_path)
        if glcm_input_shape <= len(scaler.mean_):
            scaled_feat = (glcm_feat - scaler.mean_[:glcm_input_shape]) / scaler.scale_[:glcm_input_shape]
            glcm_input = np.expand_dims(scaled_feat.astype(np.float32), axis=0)
        else:
            glcm_input = np.expand_dims(glcm_feat, axis=0)
    else:
        glcm_input = np.expand_dims(glcm_feat, axis=0)
        
    print(f"Extracted GLCM features: {glcm_feat}")
    if glcm_input_shape == 8:
        print(f"Scaled GLCM features: {glcm_input[0]}")
        
    # Run prediction
    print("Running inference...")
    pred_probs = model.predict([resnet_input, glcm_input], verbose=0)
    pred_idx = np.argmax(pred_probs[0])
    
    classes = ["CNV", "DME", "DRUSEN", "NORMAL"]
    prediction = classes[pred_idx]
    confidence = pred_probs[0][pred_idx]
    
    print("\n" + "="*30)
    print(f"Prediction: {prediction}")
    print(f"Confidence: {confidence * 100:.2f}%")
    print("Probabilities:")
    for cls, prob in zip(classes, pred_probs[0]):
        print(f"  {cls}: {prob * 100:.2f}%")
    print("="*30)

if __name__ == "__main__":
    main()
