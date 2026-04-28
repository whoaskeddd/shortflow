from dataclasses import dataclass


@dataclass(frozen=True)
class ModerationFailure:
    code: str
    field: str
    message: str


class ModerationError(Exception):
    def __init__(self, *, code: str, field: str, message: str) -> None:
        super().__init__(message)
        self.failure = ModerationFailure(code=code, field=field, message=message)

    def to_detail(self) -> dict[str, str]:
        return {
            "code": self.failure.code,
            "field": self.failure.field,
            "message": self.failure.message,
        }


class ModerationBackendUnavailableError(RuntimeError):
    pass


class VideoModerationUnavailableError(ModerationBackendUnavailableError):
    pass
