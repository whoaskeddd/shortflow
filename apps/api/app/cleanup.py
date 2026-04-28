from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.models import Comment, Notification, NotificationType, User, Video, VideoReaction
from app.storage import resolve_local_upload_path

TEST_EMAILS = {"demo@shortflow.app", "creator@shortflow.app"}
TEST_TITLES = {"Morning city run"}
TEST_DESCRIPTIONS = {"Fast-cut vertical story from downtown."}
TEST_HASHTAGS = {"running,city,motion"}
TEST_VIDEO_URL_SUBSTRINGS = {
    "storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
}


@dataclass
class CleanupSummary:
    matched_video_ids: list[int]
    matched_file_paths: list[str]
    deleted_videos: int
    deleted_comments: int
    deleted_reactions: int
    deleted_notifications: int
    deleted_files: int
    dry_run: bool


def get_test_video_query():
    return (
        select(Video)
        .join(User, User.id == Video.author_id)
        .where(
            or_(
                User.email.in_(TEST_EMAILS),
                Video.title.in_(TEST_TITLES),
                Video.description.in_(TEST_DESCRIPTIONS),
                Video.hashtags.in_(TEST_HASHTAGS),
                *[Video.video_url.contains(fragment) for fragment in sorted(TEST_VIDEO_URL_SUBSTRINGS)],
            )
        )
    )


def cleanup_test_videos(
    db: Session,
    *,
    settings: Settings | None = None,
    dry_run: bool = True,
) -> CleanupSummary:
    settings = settings or get_settings()
    videos = db.scalars(get_test_video_query()).all()
    video_ids = [video.id for video in videos]
    file_paths = []

    for video in videos:
        file_path = resolve_local_upload_path(video.video_url, settings)
        if file_path is not None and file_path.exists():
            file_paths.append(str(file_path))

    deleted_comments = 0
    deleted_reactions = 0
    deleted_notifications = 0
    deleted_videos = len(video_ids)
    deleted_files = 0

    if video_ids and not dry_run:
        deleted_comments = db.execute(
            delete(Comment).where(Comment.video_id.in_(video_ids))
        ).rowcount or 0
        deleted_reactions = db.execute(
            delete(VideoReaction).where(VideoReaction.video_id.in_(video_ids))
        ).rowcount or 0
        deleted_notifications = db.execute(
            delete(Notification).where(
                Notification.entity_id.in_(video_ids),
                Notification.type.in_(
                    [NotificationType.like, NotificationType.comment, NotificationType.repost]
                ),
            )
        ).rowcount or 0
        db.execute(delete(Video).where(Video.id.in_(video_ids)))
        db.commit()

        for raw_path in file_paths:
            path = Path(raw_path)
            if path.exists():
                path.unlink()
                deleted_files += 1

    return CleanupSummary(
        matched_video_ids=video_ids,
        matched_file_paths=file_paths,
        deleted_videos=deleted_videos,
        deleted_comments=deleted_comments,
        deleted_reactions=deleted_reactions,
        deleted_notifications=deleted_notifications,
        deleted_files=deleted_files,
        dry_run=dry_run,
    )
