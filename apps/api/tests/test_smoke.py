from uuid import uuid4

def test_healthcheck(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_and_get_profile_flow(client) -> None:
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
