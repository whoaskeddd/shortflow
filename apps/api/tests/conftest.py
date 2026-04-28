from __future__ import annotations

import os
import shutil
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

TESTS_DIR = Path(__file__).resolve().parent
TEST_DB_PATH = TESTS_DIR / "test_shortflow.db"
TEST_UPLOADS_PATH = TESTS_DIR / "test_uploads"

os.environ["APP_DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["APP_STORAGE_LOCAL_PATH"] = str(TEST_UPLOADS_PATH)
os.environ["APP_STORAGE_PUBLIC_BASE_URL"] = "http://testserver/uploads"
os.environ["APP_MODERATION_ENABLED"] = "true"
os.environ["APP_MODERATION_LANGUAGE"] = "ru"
os.environ["APP_MODERATION_WHISPER_MODEL"] = "base"
os.environ["APP_MODERATION_MAX_VIDEO_SECONDS"] = "180"

from app.config import get_settings
from app.db import Base, SessionLocal, engine
from app.main import app
from app.moderation.service import get_moderation_service


@pytest.fixture(autouse=True)
def reset_state() -> None:
    get_moderation_service.cache_clear()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    if TEST_UPLOADS_PATH.exists():
        shutil.rmtree(TEST_UPLOADS_PATH)
    TEST_UPLOADS_PATH.mkdir(parents=True, exist_ok=True)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db_session():
    with SessionLocal() as session:
        yield session


@pytest.fixture
def settings():
    return get_settings()


@pytest.fixture
def register_user(client: TestClient):
    def _register(*, email: str | None = None, username: str | None = None) -> dict[str, object]:
        unique = uuid4().hex[:8]
        actual_email = email or f"user-{unique}@example.com"
        actual_username = username or f"user_{unique}"
        response = client.post(
            "/auth/register",
            json={
                "email": actual_email,
                "username": actual_username,
                "password": "password123",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 201
        payload = response.json()
        me_response = client.get(
            "/users/me",
            headers={"Authorization": f"Bearer {payload['access_token']}"},
        )
        assert me_response.status_code == 200
        return {
            "tokens": payload,
            "user": me_response.json(),
        }

    return _register


@pytest.fixture
def make_local_upload(settings):
    base_path = Path(settings.storage_local_path)
    public_base_url = settings.storage_public_base_url.rstrip("/")

    def _make(filename: str | None = None, content: bytes = b"video-bytes") -> dict[str, object]:
        resolved_name = filename or f"{uuid4().hex}.mp4"
        file_path = base_path / resolved_name
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(content)
        return {
            "path": file_path,
            "video_url": f"{public_base_url}/{resolved_name}",
        }

    return _make
