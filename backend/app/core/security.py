import os
import hashlib
import datetime
from typing import Union, Any
import jwt

# Load security parameters from environment
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "devsecretjwtkeyforoptilightretinaldiseaseclassificationbackend")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def hash_password(password: str) -> str:
    """Hash password using cryptographically secure PBKDF2 with SHA256 and 100k iterations."""
    salt = os.urandom(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt, 
        100000
    )
    return f"{salt.hex()}:{pw_hash.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password by checking its PBKDF2 hash against the stored hash."""
    try:
        salt_hex, hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        pw_hash = hashlib.pbkdf2_hmac(
            'sha256', 
            password.encode('utf-8'), 
            salt, 
            100000
        )
        return pw_hash.hex() == hash_hex
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: datetime.timedelta = None) -> str:
    """Generate a JWT access token encoding the subject (typically user email or ID) and expiry."""
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Union[str, None]:
    """Decode and verify token signature. Returns the subject if valid, else None."""
    try:
        decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return decoded_token["sub"]
    except jwt.PyJWTError:
        return None
