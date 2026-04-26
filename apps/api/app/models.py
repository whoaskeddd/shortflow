from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class ContentStatus(StrEnum):
    approved = "approved"
    needs_review = "needs_review"
    rejected = "rejected"


class NotificationType(StrEnum):
    like = "like"
    comment = "comment"
    follow = "follow"
    repost = "repost"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    bio: Mapped[str] = mapped_column(Text, default="")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    videos: Mapped[list["Video"]] = relationship(back_populates="author", cascade="all, delete-orphan")


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")
    video_url: Mapped[str] = mapped_column(String(500))
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hashtags: Mapped[str] = mapped_column(String(255), default="")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    saves_count: Mapped[int] = mapped_column(Integer, default=0)
    reposts_count: Mapped[int] = mapped_column(Integer, default=0)
    content_status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus), default=ContentStatus.approved
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    author: Mapped[User] = relationship(back_populates="videos")
    comments: Mapped[list["Comment"]] = relationship(back_populates="video", cascade="all, delete-orphan")


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("follower_id", "following_id", name="uq_follow_pair"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    following_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VideoReaction(Base):
    __tablename__ = "video_reactions"
    __table_args__ = (UniqueConstraint("user_id", "video_id", "kind", name="uq_reaction_triplet"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), index=True)
    kind: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id"), nullable=True, index=True)
    body: Mapped[str] = mapped_column(Text)
    content_status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus), default=ContentStatus.approved
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    video: Mapped[Video] = relationship(back_populates="comments")
    parent: Mapped["Comment | None"] = relationship(remote_side=[id], back_populates="replies")
    replies: Mapped[list["Comment"]] = relationship(back_populates="parent", cascade="all, delete-orphan")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    entity_id: Mapped[int | None] = mapped_column(nullable=True)
    message: Mapped[str] = mapped_column(String(255))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
