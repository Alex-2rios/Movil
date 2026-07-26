from app.config import Settings
from app.security import create_access_token, decode_access_token


def test_access_token_contains_identity_and_roles():
    settings = Settings(
        database_url="postgresql://test:test@localhost/test",
        jwt_secret="a-secure-test-secret-with-32-characters",
    )
    token = create_access_token(
        user_id=7,
        username="mesero",
        roles=["mesero"],
        settings=settings,
    )

    payload = decode_access_token(token, settings)

    assert payload["uid"] == 7
    assert payload["sub"] == "mesero"
    assert payload["roles"] == ["mesero"]
    assert payload["exp"] > payload["iat"]
