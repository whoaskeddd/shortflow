from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_token(subject: str, token_type: str, expires_minutes: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "type": token_type, "exp": expires_at}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong token type")
    return payload
