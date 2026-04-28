from __future__ import annotations

from dataclasses import dataclass

from app.models import Comment, ContentStatus, Follow, Notification, NotificationType, Video, VideoReaction
from app.moderation.service import ModerationService


@dataclass
class StubVideoModerator:
    transcript: str = ""

    def assert_duration_allowed(self, _video_path) -> None:
        return None

    def transcribe(self, _video_path) -> str:
        return self.transcript


@dataclass
class StubTextModerator:
    profane_terms: tuple[str, ...] = ()

    def is_profane(self, text: str) -> bool:
        lowered = text.lower()
        return any(term in lowered for term in self.profane_terms)


def build_stub_moderation_service(
    *,
    transcript: str = "",
    profane_terms: tuple[str, ...] = (),
) -> ModerationService:
    from app.config import get_settings

    return ModerationService(
        settings=get_settings(),
        text_moderator=StubTextModerator(profane_terms=profane_terms),
        video_moderator=StubVideoModerator(transcript=transcript),
    )


def test_video_title_with_profanity_is_rejected(client, register_user, make_local_upload, monkeypatch) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr("app.main.get_moderation_service", lambda: build_stub_moderation_service())

    response = client.post(
        "/videos",
        json={
            "title": "Какой пиздец",
            "description": "чистое описание",
            "video_url": upload["video_url"],
            "hashtags": ["тест"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == {
        "code": "PROFANITY_DETECTED",
        "field": "title",
        "message": "Название содержит нецензурную брань.",
    }
    assert not upload["path"].exists()


def test_comment_with_profanity_is_rejected(client, register_user, make_local_upload, monkeypatch) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr("app.main.get_moderation_service", lambda: build_stub_moderation_service())

    video_response = client.post(
        "/videos",
        json={
            "title": "Чистый ролик",
            "description": "без проблем",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )
    assert video_response.status_code == 201
    video_id = video_response.json()["id"]

    comment_response = client.post(
        f"/videos/{video_id}/comments",
        json={"body": "ну и хуйня"},
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert comment_response.status_code == 422
    assert comment_response.json()["detail"] == {
        "code": "PROFANITY_DETECTED",
        "field": "comment",
        "message": "Комментарий содержит нецензурную брань.",
    }

    comments_response = client.get(f"/videos/{video_id}/comments")
    assert comments_response.status_code == 200
    assert comments_response.json() == []


def test_video_blacklist_variation_is_rejected(client, register_user, make_local_upload, monkeypatch) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr("app.main.get_moderation_service", lambda: build_stub_moderation_service())

    response = client.post(
        "/videos",
        json={
            "title": "Это х у й н я какая-то",
            "description": "чистое описание",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["field"] == "title"
    assert not upload["path"].exists()


def test_comment_blacklist_variation_is_rejected(client, register_user, make_local_upload, monkeypatch) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr("app.main.get_moderation_service", lambda: build_stub_moderation_service())

    video_response = client.post(
        "/videos",
        json={
            "title": "Чистый ролик",
            "description": "без проблем",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )
    assert video_response.status_code == 201
    video_id = video_response.json()["id"]

    comment_response = client.post(
        f"/videos/{video_id}/comments",
        json={"body": "ну и х-у-й-н-я"},
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert comment_response.status_code == 422
    assert comment_response.json()["detail"]["field"] == "comment"


def test_video_transcript_with_profanity_is_rejected_and_upload_deleted(
    client, register_user, make_local_upload, monkeypatch
) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr(
        "app.main.get_moderation_service",
        lambda: build_stub_moderation_service(transcript="это пиздец какой-то"),
    )

    response = client.post(
        "/videos",
        json={
            "title": "Чистый title",
            "description": "чистое описание",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == {
        "code": "PROFANITY_DETECTED",
        "field": "video",
        "message": "Видео содержит нецензурную брань в аудиодорожке.",
    }
    assert not upload["path"].exists()


def test_video_transcript_blacklist_variation_is_rejected_and_upload_deleted(
    client, register_user, make_local_upload, monkeypatch
) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr(
        "app.main.get_moderation_service",
        lambda: build_stub_moderation_service(transcript="это е б а н ы й звук"),
    )

    response = client.post(
        "/videos",
        json={
            "title": "Чистый title",
            "description": "чистое описание",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["field"] == "video"
    assert not upload["path"].exists()


def test_video_transcript_with_blat_is_rejected(client, register_user, make_local_upload, monkeypatch) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr(
        "app.main.get_moderation_service",
        lambda: build_stub_moderation_service(transcript="это блять слышно очень четко"),
    )

    response = client.post(
        "/videos",
        json={
            "title": "Чистый title",
            "description": "чистое описание",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["field"] == "video"
    assert not upload["path"].exists()


def test_only_approved_content_is_visible(client, db_session, register_user) -> None:
    author = register_user()
    follower = register_user()

    approved_video = Video(
        author_id=author["user"]["id"],
        title="Чистый ролик",
        description="описание",
        video_url="http://testserver/uploads/approved.mp4",
        hashtags="чисто,поиск",
        duration_seconds=12,
        content_status=ContentStatus.approved,
    )
    hidden_video = Video(
        author_id=author["user"]["id"],
        title="Скрытый ролик",
        description="скрытое описание",
        video_url="http://testserver/uploads/rejected.mp4",
        hashtags="скрыто",
        duration_seconds=10,
        content_status=ContentStatus.rejected,
    )
    db_session.add_all([approved_video, hidden_video])
    db_session.flush()

    db_session.add(Follow(follower_id=follower["user"]["id"], following_id=author["user"]["id"]))
    db_session.add_all(
        [
            Comment(
                video_id=approved_video.id,
                author_id=author["user"]["id"],
                parent_id=None,
                body="Нормальный комментарий",
                content_status=ContentStatus.approved,
            ),
            Comment(
                video_id=approved_video.id,
                author_id=author["user"]["id"],
                parent_id=None,
                body="Скрытый комментарий",
                content_status=ContentStatus.rejected,
            ),
        ]
    )
    db_session.commit()

    feed_response = client.get("/videos/feed")
    assert feed_response.status_code == 200
    assert [item["id"] for item in feed_response.json()] == [approved_video.id]

    search_response = client.get("/search", params={"q": "ролик"})
    assert search_response.status_code == 200
    assert [item["id"] for item in search_response.json()["videos"]] == [approved_video.id]

    detail_response = client.get(f"/videos/{approved_video.id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == approved_video.id

    hidden_detail_response = client.get(f"/videos/{hidden_video.id}")
    assert hidden_detail_response.status_code == 404

    comments_response = client.get(f"/videos/{approved_video.id}/comments")
    assert comments_response.status_code == 200
    assert [item["body"] for item in comments_response.json()] == ["Нормальный комментарий"]

    hidden_comments_response = client.get(f"/videos/{hidden_video.id}/comments")
    assert hidden_comments_response.status_code == 404

    following_response = client.get(
        "/videos/following",
        headers={"Authorization": f"Bearer {follower['tokens']['access_token']}"},
    )
    assert following_response.status_code == 200
    assert [item["id"] for item in following_response.json()] == [approved_video.id]


def test_author_can_fetch_own_videos(client, db_session, register_user) -> None:
    author = register_user()
    other = register_user()

    author_video = Video(
        author_id=author["user"]["id"],
        title="Мой ролик",
        description="описание",
        video_url="http://testserver/uploads/mine.mp4",
        hashtags="мой",
        duration_seconds=12,
        content_status=ContentStatus.approved,
    )
    other_video = Video(
        author_id=other["user"]["id"],
        title="Чужой ролик",
        description="описание",
        video_url="http://testserver/uploads/other.mp4",
        hashtags="чужой",
        duration_seconds=12,
        content_status=ContentStatus.approved,
    )
    db_session.add_all([author_video, other_video])
    db_session.commit()

    response = client.get(
        "/users/me/videos",
        headers={"Authorization": f"Bearer {author['tokens']['access_token']}"},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [author_video.id]


def test_author_can_delete_own_video_and_related_entities(
    client, db_session, register_user, make_local_upload
) -> None:
    author = register_user()
    actor = register_user()
    upload = make_local_upload(filename="owned.mp4")

    video = Video(
        author_id=author["user"]["id"],
        title="Мой ролик",
        description="описание",
        video_url=upload["video_url"],
        hashtags="мой",
        duration_seconds=12,
        content_status=ContentStatus.approved,
        likes_count=1,
        comments_count=1,
    )
    db_session.add(video)
    db_session.flush()
    db_session.add(
        Comment(
            video_id=video.id,
            author_id=actor["user"]["id"],
            parent_id=None,
            body="Нормальный комментарий",
            content_status=ContentStatus.approved,
        )
    )
    db_session.add(VideoReaction(user_id=actor["user"]["id"], video_id=video.id, kind="like"))
    db_session.add(
        Notification(
            user_id=author["user"]["id"],
            actor_id=actor["user"]["id"],
            type=NotificationType.like,
            entity_id=video.id,
            message="actor liked your video",
        )
    )
    db_session.commit()

    response = client.delete(
        f"/videos/{video.id}",
        headers={"Authorization": f"Bearer {author['tokens']['access_token']}"},
    )

    video_id = video.id
    assert response.status_code == 204
    db_session.expire_all()
    assert not upload["path"].exists()
    assert db_session.get(Video, video_id) is None
    assert db_session.query(Comment).filter(Comment.video_id == video_id).count() == 0
    assert db_session.query(VideoReaction).filter(VideoReaction.video_id == video_id).count() == 0
    assert db_session.query(Notification).filter(Notification.entity_id == video_id).count() == 0


def test_cannot_delete_another_users_video(client, db_session, register_user) -> None:
    author = register_user()
    other = register_user()

    video = Video(
        author_id=author["user"]["id"],
        title="Мой ролик",
        description="описание",
        video_url="http://testserver/uploads/mine.mp4",
        hashtags="мой",
        duration_seconds=12,
        content_status=ContentStatus.approved,
    )
    db_session.add(video)
    db_session.commit()

    response = client.delete(
        f"/videos/{video.id}",
        headers={"Authorization": f"Bearer {other['tokens']['access_token']}"},
    )

    assert response.status_code == 403


def test_self_like_and_comment_create_notifications(
    client, register_user, make_local_upload, monkeypatch
) -> None:
    account = register_user()
    upload = make_local_upload()
    monkeypatch.setattr("app.main.get_moderation_service", lambda: build_stub_moderation_service())

    video_response = client.post(
        "/videos",
        json={
            "title": "Мой ролик",
            "description": "без проблем",
            "video_url": upload["video_url"],
            "hashtags": ["ok"],
            "duration_seconds": 24,
        },
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )
    assert video_response.status_code == 201
    video_id = video_response.json()["id"]

    like_response = client.post(
        f"/videos/{video_id}/like",
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )
    assert like_response.status_code == 200
    assert like_response.json() == {"active": True}

    comment_response = client.post(
        f"/videos/{video_id}/comments",
        json={"body": "Сам себе пишу комментарий"},
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )
    assert comment_response.status_code == 201

    notifications_response = client.get(
        "/notifications",
        headers={"Authorization": f"Bearer {account['tokens']['access_token']}"},
    )

    assert notifications_response.status_code == 200
    notifications = notifications_response.json()
    assert [item["type"] for item in notifications] == ["comment", "like"]
    assert all(item["actor_id"] == account["user"]["id"] for item in notifications)
