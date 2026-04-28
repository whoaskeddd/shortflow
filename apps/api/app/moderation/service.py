from __future__ import annotations

from functools import lru_cache

from app.config import Settings, get_settings
from app.moderation.errors import ModerationError
from app.moderation.normalize import compact_text, normalize_text
from app.moderation.text import ModelTextModerator
from app.moderation.video import WhisperVideoModerator
from app.storage import resolve_local_upload_path

FIELD_MESSAGES = {
    "title": "Название содержит нецензурную брань.",
    "description": "Описание содержит нецензурную брань.",
    "hashtags": "Теги содержат нецензурную брань.",
    "comment": "Комментарий содержит нецензурную брань.",
    "video": "Видео содержит нецензурную брань в аудиодорожке.",
}

DEFAULT_BLOCKLIST_TERMS = (
    "бляд",
    "блят",
    "пизд",
    "хуй",
    "хуйн",
    "ебат",
    "ебан",
    "ебуч",
    "нахуй",
    "охуе",
)


class ModerationService:
    def __init__(
        self,
        *,
        settings: Settings,
        text_moderator: ModelTextModerator | None = None,
        video_moderator: WhisperVideoModerator | None = None,
    ) -> None:
        self.settings = settings
        self.text_moderator = text_moderator or ModelTextModerator(settings)
        self.video_moderator = video_moderator or WhisperVideoModerator(settings)
        self.blocked_terms = self._build_blocklist(settings.moderation_blocklist)

    @staticmethod
    def _build_blocklist(raw_blocklist: str) -> tuple[str, ...]:
        merged_terms = [*DEFAULT_BLOCKLIST_TERMS, *raw_blocklist.split(",")]
        unique_terms: list[str] = []

        for term in (normalize_text(item) for item in merged_terms):
            if term and term not in unique_terms:
                unique_terms.append(term)

        return tuple(unique_terms)

    def contains_blocked_term(self, text: str) -> bool:
        normalized = normalize_text(text)
        compact = compact_text(text)

        for term in self.blocked_terms:
            compact_term = compact_text(term)
            if term in normalized or (compact_term and compact_term in compact):
                return True
        return False

    def assert_text_allowed(self, field: str, text: str) -> None:
        if not self.settings.moderation_enabled or not text.strip():
            return

        if self.contains_blocked_term(text) or self.text_moderator.is_profane(text):
            raise ModerationError(
                code="PROFANITY_DETECTED",
                field=field,
                message=FIELD_MESSAGES[field],
            )

    def assert_hashtags_allowed(self, hashtags: list[str]) -> None:
        if not hashtags:
            return

        self.assert_text_allowed("hashtags", " ".join(hashtags))

    def assert_video_allowed(self, video_url: str) -> None:
        if not self.settings.moderation_enabled:
            return

        video_path = resolve_local_upload_path(video_url, self.settings)
        if video_path is None or not video_path.exists():
            raise ModerationError(
                code="VIDEO_SOURCE_UNSUPPORTED",
                field="video",
                message="Для публикации сначала загрузите локальный файл через /videos/upload.",
            )

        self.video_moderator.assert_duration_allowed(video_path)
        transcript = self.video_moderator.transcribe(video_path)

        if transcript and (self.contains_blocked_term(transcript) or self.text_moderator.is_profane(transcript)):
            raise ModerationError(
                code="PROFANITY_DETECTED",
                field="video",
                message=FIELD_MESSAGES["video"],
            )


@lru_cache
def get_moderation_service() -> ModerationService:
    settings = get_settings()
    return ModerationService(settings=settings)
