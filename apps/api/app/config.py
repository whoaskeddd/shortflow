from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    name: str = "ShortFlow API"
    env: str = "development"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./shortflow.db"
    redis_url: str = "redis://localhost:6379/0"
    storage_backend: str = "local"
    storage_local_path: Path = Field(default=Path("./data/uploads"))
    storage_public_base_url: str = "http://localhost:8000/uploads"
    s3_endpoint: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_bucket: str = "shortflow"
    moderation_enabled: bool = True
    moderation_language: str = "ru"
    moderation_whisper_model: str = "base"
    moderation_max_video_seconds: int = 180
    moderation_text_model_id: str = "cointegrated/rubert-tiny-toxicity"
    moderation_text_model_revision: str = "fd5e387"
    moderation_obscenity_threshold: float = 0.5
    moderation_blocklist: str = "пиздец,хуйня,хуй,ебать,ебан"


@lru_cache
def get_settings() -> Settings:
    return Settings()
