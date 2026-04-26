import os
from fastapi.testclient import TestClient
from uuid import uuid4

os.environ["APP_DATABASE_URL"] = "sqlite:///./test_shortflow.db"

from app.db import Base, engine
from app.main import app

Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_and_get_profile_flow() -> None:
    unique = uuid4().hex[:8]
    register_response = client.post(
        "/auth/register",
        json={
            "email": f"smoke-{unique}@example.com",
            "username": f"smoke_{unique}",
            "password": "password123",
            "full_name": "Smoke User"
        },
    )
    assert register_response.status_code == 201
    tokens = register_response.json()

    me_response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == f"smoke-{unique}@example.com"
