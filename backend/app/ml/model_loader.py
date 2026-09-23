import os
import logging
import tensorflow as tf
import joblib

logger = logging.getLogger("opti_light")

# Global containers for loaded assets
_model = None
_scaler = None
_glcm_dim = 6  # default fallback

# Register the custom Cast layer for mixed precision compatibility (H5/Keras 3)
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

def load_model_assets():
    """
    Load Keras model and fitted StandardScaler into memory.
    Reads paths from environment variables.
    """
    global _model, _scaler, _glcm_dim
    
    # Disable GPU warnings if on native Windows with TF >= 2.11
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    tf.get_logger().setLevel('ERROR')
    
    # 1. Load the Model
    model_relative_path = os.getenv("MODEL_PATH", "model/best_model.h5")
    # Resolve absolute path relative to the backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    model_path = os.path.abspath(os.path.join(backend_dir, model_relative_path))
    
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at: {model_path}")
        raise FileNotFoundError(f"Model file not found at: {model_path}")
        
    logger.info(f"Loading Keras model from: {model_path}...")
    try:
        _model = tf.keras.models.load_model(model_path, custom_objects={"Cast": Cast}, compile=False)
        logger.info("Model loaded successfully!")
        
        # Determine expected GLCM feature dimension (second input layer)
        if len(_model.inputs) > 1:
            _glcm_dim = _model.inputs[1].shape[1]
            logger.info(f"Detected model expected GLCM feature dimension: {_glcm_dim}")
        else:
            logger.warning("Could not determine GLCM feature dimension from model inputs. Defaulting to 6.")
            _glcm_dim = 6
    except Exception as e:
        logger.error(f"Failed to load Keras model: {e}")
        raise e
        
    # 2. Load the Scaler
    scaler_relative_path = os.getenv("SCALER_PATH", "model/saved_scaler.pkl")
    scaler_path = os.path.abspath(os.path.join(backend_dir, scaler_relative_path))
    
    if os.path.exists(scaler_path):
        logger.info(f"Loading StandardScaler from: {scaler_path}...")
        try:
            _scaler = joblib.load(scaler_path)
            logger.info("Scaler loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load scaler: {e}")
            raise e
    else:
        logger.warning("No scaler file found; proceeding with unscaled inputs.")
        _scaler = None

def get_model():
    """Retrieve the loaded Keras model instance."""
    return _model

def get_scaler():
    """Retrieve the loaded StandardScaler instance (may be None)."""
    return _scaler

def get_glcm_dim():
    """Retrieve the detected GLCM feature dimension (6 or 8)."""
    return _glcm_dim
