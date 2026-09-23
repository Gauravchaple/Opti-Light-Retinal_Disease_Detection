import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("opti_light")

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:@localhost:3306/optilight_db"
)

engine = None
SessionLocal = None
Base = declarative_base()

try:
    logger.info(f"Attempting to connect to primary database...")
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # Try to connect to MySQL with a short timeout to prevent long hangs on startup
        engine = create_engine(
            DATABASE_URL, 
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5}
        )
    # Test connection
    with engine.connect() as conn:
        logger.info("Successfully connected to primary database.")
except Exception as e:
    logger.error(f"Failed to connect to primary database: {e}")
    # Fallback to SQLite
    sqlite_url = "sqlite:///./optilight_db.db"
    logger.info(f"Falling back to local SQLite database: {sqlite_url}")
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to retrieve database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
