from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

from fastapi import UploadFile

from app.config import Settings, get_settings


class LocalStorage:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_path = Path(self.settings.storage_local_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save_upload(self, upload: UploadFile) -> str:
        suffix = Path(upload.filename or "upload.bin").suffix
        target_name = f"{uuid4().hex}{suffix}"
        target = self.base_path / target_name
        with target.open("wb") as file_obj:
            file_obj.write(upload.file.read())
        return f"{self.settings.storage_public_base_url}/{target_name}"

    def resolve_upload_path(self, video_url: str) -> Path | None:
        return resolve_local_upload_path(video_url, self.settings)

    def delete_upload(self, video_url: str) -> bool:
        return delete_local_upload(video_url, self.settings)


def resolve_local_upload_path(video_url: str, settings: Settings | None = None) -> Path | None:
    settings = settings or get_settings()
    public_base_url = settings.storage_public_base_url.rstrip("/")
    if not video_url.startswith(public_base_url):
        return None

    parsed = urlparse(video_url)
    filename = Path(parsed.path).name
    if not filename:
        return None

    return Path(settings.storage_local_path) / filename


def delete_local_upload(video_url: str, settings: Settings | None = None) -> bool:
    file_path = resolve_local_upload_path(video_url, settings)
    if file_path is None or not file_path.exists():
        return False

    file_path.unlink()
    return True


def get_storage() -> LocalStorage:
    return LocalStorage()
