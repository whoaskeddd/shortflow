from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import get_settings


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


def get_storage() -> LocalStorage:
    return LocalStorage()
