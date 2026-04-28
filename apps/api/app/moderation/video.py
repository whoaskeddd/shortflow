from __future__ import annotations

import math
import subprocess
import tempfile
from pathlib import Path

from app.config import Settings
from app.moderation.errors import ModerationError, VideoModerationUnavailableError


class WhisperVideoModerator:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._model = None

    def assert_duration_allowed(self, video_path: Path) -> None:
        duration_seconds = self.probe_duration_seconds(video_path)
        max_duration = self.settings.moderation_max_video_seconds

        if duration_seconds is None or max_duration <= 0 or duration_seconds <= max_duration:
            return

        raise ModerationError(
            code="VIDEO_TOO_LONG",
            field="video",
            message=f"Видео длиннее {max_duration} секунд и не может быть опубликовано.",
        )

    def transcribe(self, video_path: Path) -> str:
        with tempfile.TemporaryDirectory(prefix="shortflow-moderation-") as temp_dir:
            audio_path = Path(temp_dir) / "audio.wav"
            self.extract_audio(video_path, audio_path)

            if not audio_path.exists() or audio_path.stat().st_size == 0:
                return ""

            model = self.get_model()
            segments, _info = model.transcribe(
                str(audio_path),
                language=self.settings.moderation_language,
                beam_size=1,
                vad_filter=True,
                condition_on_previous_text=False,
            )
            return " ".join(segment.text.strip() for segment in segments if segment.text.strip())

    def get_model(self):
        if self._model is not None:
            return self._model

        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise VideoModerationUnavailableError(
                "Video moderation dependency is unavailable. Install faster-whisper first."
            ) from exc

        self._model = WhisperModel(
            self.settings.moderation_whisper_model,
            device="cpu",
            compute_type="int8",
        )
        return self._model

    def probe_duration_seconds(self, video_path: Path) -> int | None:
        command = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
        completed = subprocess.run(command, capture_output=True, text=True, check=False)

        if completed.returncode != 0:
            return None

        try:
            return math.ceil(float(completed.stdout.strip()))
        except ValueError:
            return None

    def extract_audio(self, video_path: Path, audio_path: Path) -> None:
        command = [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-map",
            "a?",
            "-ac",
            "1",
            "-ar",
            "16000",
            str(audio_path),
        ]
        completed = subprocess.run(command, capture_output=True, text=True, check=False)

        if completed.returncode == 0:
            return

        raise VideoModerationUnavailableError(
            "Video moderation is unavailable because ffmpeg audio extraction failed."
        )
