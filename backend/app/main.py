import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.ml.model_loader import load_model_assets
from app.db.database import Base, engine
from app.db import models # Import models to register them on Base
from app.api.routes import health, prediction, auth

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("opti_light")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load database tables and model assets
    logger.info("Initializing Opti-Light application...")
    
    # 1. Create database schema if not exists
    try:
        logger.info("Creating database tables if not exist...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified.")
    except Exception as e:
        logger.error(f"Database table creation failed: {e}")
        
    # 2. Load ML model assets into memory
    try:
        load_model_assets()
        logger.info("Application initialized and ready for requests.")
    except Exception as e:
        logger.critical(f"Startup ML model initialization failed: {e}")
        
    yield
    # Shutdown: Clean up assets if required
    logger.info("Shutting down Opti-Light application...")

app = FastAPI(
    title="Opti-Light - Retinal Disease Detection API",
    description="A FastAPI backend for clinical decision support detecting DME, CNV, and Drusen from OCT scans.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router, prefix="/api", tags=["System Health"])
app.include_router(prediction.router, prefix="/api", tags=["ML Prediction"])
app.include_router(auth.router, prefix="/api", tags=["Authentication"])

# Serve static files for uploaded image files
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
