from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import ContentStatus, NotificationType


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: str
    bio: str
    avatar_url: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    bio: str | None = None
    avatar_url: str | None = None


class VideoCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    video_url: str
    thumbnail_url: str | None = None
    hashtags: list[str] = Field(default_factory=list)
    duration_seconds: int = 0


class VideoOut(BaseModel):
    id: int
    author_id: int
    title: str
    description: str
    video_url: str
    thumbnail_url: str | None
    hashtags: list[str]
    duration_seconds: int
    views_count: int
    likes_count: int
    comments_count: int
    saves_count: int
    reposts_count: int
    content_status: ContentStatus
    created_at: datetime
    author: UserOut

    model_config = {"from_attributes": True}


class CommentCreateRequest(BaseModel):
    body: str = Field(min_length=1, max_length=2000)
    parent_id: int | None = None


class CommentOut(BaseModel):
    id: int
    video_id: int
    author_id: int
    parent_id: int | None
    body: str
    content_status: ContentStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: int
    user_id: int
    actor_id: int
    type: NotificationType
    entity_id: int | None
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ModerationStatusUpdate(BaseModel):
    content_status: ContentStatus


def serialize_video_tags(raw_tags: str) -> list[str]:
    if not raw_tags:
        return []
    return [tag for tag in raw_tags.split(",") if tag]
