from dataclasses import dataclass

from app.moderation.service import ModerationService


@dataclass
class StubModelTextModerator:
    score: float

    def is_profane(self, _text: str) -> bool:
        return self.score >= 0.5


@dataclass
class StubVideoModerator:
    def assert_duration_allowed(self, _video_path) -> None:
        return None

    def transcribe(self, _video_path) -> str:
        return ""


def test_text_model_allows_clean_text() -> None:
    from app.config import get_settings

    service = ModerationService(
        settings=get_settings(),
        text_moderator=StubModelTextModerator(score=0.1),
        video_moderator=StubVideoModerator(),
    )
    service.assert_text_allowed("title", "Сегодня отличный день для съемки ролика")


def test_text_model_blocks_profane_text() -> None:
    from app.config import get_settings
    from app.moderation.errors import ModerationError

    service = ModerationService(
        settings=get_settings(),
        text_moderator=StubModelTextModerator(score=0.9),
        video_moderator=StubVideoModerator(),
    )

    try:
        service.assert_text_allowed("comment", "Какой ужас")
    except ModerationError as error:
        assert error.to_detail() == {
            "code": "PROFANITY_DETECTED",
            "field": "comment",
            "message": "Комментарий содержит нецензурную брань.",
        }
    else:
        raise AssertionError("Expected ModerationError for profane text")
