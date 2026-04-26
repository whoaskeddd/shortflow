from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import case, desc, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.db import Base, engine, get_db
from app.deps import get_current_user
from app.models import Comment, ContentStatus, Follow, Notification, NotificationType, User, Video, VideoReaction
from app.schemas import (
    CommentCreateRequest,
    CommentOut,
    LoginRequest,
    ModerationStatusUpdate,
    NotificationOut,
    ProfileUpdateRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserOut,
    VideoCreateRequest,
    VideoOut,
    serialize_video_tags,
)
from app.security import create_token, decode_token, hash_password, verify_password
from app.storage import get_storage


settings = get_settings()
app = FastAPI(title=settings.name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


if settings.storage_backend == "local":
    settings.storage_local_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.storage_local_path), name="uploads")


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def issue_token_pair(user_id: int) -> TokenPair:
    return TokenPair(
        access_token=create_token(str(user_id), "access", settings.access_token_expire_minutes),
        refresh_token=create_token(str(user_id), "refresh", settings.refresh_token_expire_minutes),
    )


def video_to_schema(video: Video) -> VideoOut:
    return VideoOut(
        id=video.id,
        author_id=video.author_id,
        title=video.title,
        description=video.description,
        video_url=video.video_url,
        thumbnail_url=video.thumbnail_url,
        hashtags=serialize_video_tags(video.hashtags),
        duration_seconds=video.duration_seconds,
        views_count=video.views_count,
        likes_count=video.likes_count,
        comments_count=video.comments_count,
        saves_count=video.saves_count,
        reposts_count=video.reposts_count,
        content_status=video.content_status,
        created_at=video.created_at,
        author=UserOut.model_validate(video.author),
    )


def create_notification(
    db: Session, user_id: int, actor_id: int, notif_type: NotificationType, entity_id: int | None, message: str
) -> None:
    if user_id == actor_id:
        return
    db.add(
        Notification(
            user_id=user_id,
            actor_id=actor_id,
            type=notif_type,
            entity_id=entity_id,
            message=message,
        )
    )


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    existing_user = db.scalar(select(User).where(or_(User.email == payload.email, User.username == payload.username)))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return issue_token_pair(user.id)


@app.post("/auth/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return issue_token_pair(user.id)


@app.post("/auth/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest) -> TokenPair:
    decoded = decode_token(payload.refresh_token, "refresh")
    return issue_token_pair(int(decoded["sub"]))


@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> None:
    return None


@app.get("/users/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@app.patch("/users/me", response_model=UserOut)
def update_me(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserOut:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut.model_validate(user)


@app.post("/videos/upload")
def upload_video(file: UploadFile = File(...)) -> dict[str, str]:
    storage = get_storage()
    return {"video_url": storage.save_upload(file)}


@app.post("/videos", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
def create_video(
    payload: VideoCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VideoOut:
    video = Video(
        author_id=current_user.id,
        title=payload.title,
        description=payload.description,
        video_url=payload.video_url,
        thumbnail_url=payload.thumbnail_url,
        hashtags=",".join(payload.hashtags),
        duration_seconds=payload.duration_seconds,
        content_status=ContentStatus.approved,
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    video.author = current_user
    return video_to_schema(video)


@app.get("/videos/{video_id:int}", response_model=VideoOut)
def get_video(video_id: int, db: Session = Depends(get_db)) -> VideoOut:
    video = db.scalar(select(Video).options(joinedload(Video.author)).where(Video.id == video_id))
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    video.views_count += 1
    db.add(video)
    db.commit()
    db.refresh(video)
    return video_to_schema(video)


@app.get("/videos/feed", response_model=list[VideoOut])
def get_feed(limit: int = Query(20, le=50), db: Session = Depends(get_db)) -> list[VideoOut]:
    query = (
        select(Video)
        .options(joinedload(Video.author))
        .where(Video.content_status == ContentStatus.approved)
        .order_by(desc(Video.likes_count + Video.comments_count + Video.views_count), desc(Video.created_at))
        .limit(limit)
    )
    return [video_to_schema(video) for video in db.scalars(query).unique().all()]


@app.get("/videos/following", response_model=list[VideoOut])
def get_following_feed(
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[VideoOut]:
    query = (
        select(Video)
        .join(Follow, Follow.following_id == Video.author_id)
        .options(joinedload(Video.author))
        .where(Follow.follower_id == current_user.id)
        .order_by(desc(Video.created_at))
        .limit(limit)
    )
    return [video_to_schema(video) for video in db.scalars(query).unique().all()]


def toggle_reaction(
    db: Session,
    current_user: User,
    video_id: int,
    kind: str,
    counter_field: str,
    notification_type: NotificationType | None,
    message_verb: str,
) -> dict[str, bool]:
    video = db.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    reaction = db.scalar(
        select(VideoReaction).where(
            VideoReaction.user_id == current_user.id,
            VideoReaction.video_id == video_id,
            VideoReaction.kind == kind,
        )
    )
    active = reaction is None
    if active:
        db.add(VideoReaction(user_id=current_user.id, video_id=video_id, kind=kind))
        setattr(video, counter_field, getattr(video, counter_field) + 1)
        if notification_type is not None:
            create_notification(
                db,
                user_id=video.author_id,
                actor_id=current_user.id,
                notif_type=notification_type,
                entity_id=video.id,
                message=f"{current_user.username} {message_verb} your video",
            )
    else:
        db.delete(reaction)
        setattr(video, counter_field, max(0, getattr(video, counter_field) - 1))
    db.add(video)
    db.commit()
    return {"active": active}


@app.post("/videos/{video_id:int}/like")
def like_video(
    video_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, bool]:
    return toggle_reaction(db, current_user, video_id, "like", "likes_count", NotificationType.like, "liked")


@app.post("/videos/{video_id:int}/save")
def save_video(
    video_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, bool]:
    return toggle_reaction(db, current_user, video_id, "save", "saves_count", None, "saved")


@app.post("/videos/{video_id:int}/repost")
def repost_video(
    video_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, bool]:
    return toggle_reaction(
        db, current_user, video_id, "repost", "reposts_count", NotificationType.repost, "reposted"
    )


@app.get("/videos/{video_id:int}/comments", response_model=list[CommentOut])
def get_comments(video_id: int, db: Session = Depends(get_db)) -> list[CommentOut]:
    comments = db.scalars(select(Comment).where(Comment.video_id == video_id).order_by(Comment.created_at)).all()
    return [CommentOut.model_validate(comment) for comment in comments]


@app.post("/videos/{video_id:int}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    video_id: int,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentOut:
    video = db.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    comment = Comment(
        video_id=video_id,
        author_id=current_user.id,
        parent_id=payload.parent_id,
        body=payload.body,
        content_status=ContentStatus.approved,
    )
    video.comments_count += 1
    db.add(comment)
    db.add(video)
    create_notification(
        db,
        user_id=video.author_id,
        actor_id=current_user.id,
        notif_type=NotificationType.comment,
        entity_id=video.id,
        message=f"{current_user.username} commented on your video",
    )
    db.commit()
    db.refresh(comment)
    return CommentOut.model_validate(comment)


@app.delete("/comments/{comment_id:int}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another comment")
    video = db.get(Video, comment.video_id)
    if video:
        video.comments_count = max(0, video.comments_count - 1)
        db.add(video)
    db.delete(comment)
    db.commit()
    return None


@app.post("/follows/{user_id:int}")
def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    relation = db.scalar(
        select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)
    )
    if relation:
        return {"following": True}
    db.add(Follow(follower_id=current_user.id, following_id=user_id))
    create_notification(
        db,
        user_id=user_id,
        actor_id=current_user.id,
        notif_type=NotificationType.follow,
        entity_id=current_user.id,
        message=f"{current_user.username} started following you",
    )
    db.commit()
    return {"following": True}


@app.delete("/follows/{user_id:int}", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    relation = db.scalar(
        select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)
    )
    if relation:
        db.delete(relation)
        db.commit()
    return None


@app.get("/search")
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)) -> dict[str, list]:
    like_pattern = f"%{q.lower()}%"
    users = db.scalars(
        select(User).where(
            or_(func.lower(User.username).like(like_pattern), func.lower(User.full_name).like(like_pattern))
        )
    ).all()
    videos = (
        db.scalars(
            select(Video)
            .options(joinedload(Video.author))
            .where(
                or_(
                    func.lower(Video.title).like(like_pattern),
                    func.lower(Video.description).like(like_pattern),
                    func.lower(Video.hashtags).like(like_pattern),
                )
            )
        )
        .unique()
        .all()
    )
    return {
        "users": [UserOut.model_validate(user).model_dump() for user in users],
        "videos": [video_to_schema(video).model_dump() for video in videos],
    }


@app.get("/notifications", response_model=list[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[NotificationOut]:
    notifications = db.scalars(
        select(Notification).where(Notification.user_id == current_user.id).order_by(desc(Notification.created_at))
    ).all()
    return [NotificationOut.model_validate(item) for item in notifications]


@app.get("/admin/content")
def get_content_queue(
    status_filter: ContentStatus | None = None,
    db: Session = Depends(get_db),
) -> dict[str, list]:
    query = select(Video).options(joinedload(Video.author))
    if status_filter:
        query = query.where(Video.content_status == status_filter)
    videos = (
        db.scalars(
            query.order_by(
                case((Video.content_status == ContentStatus.needs_review, 0), else_=1),
                desc(Video.created_at),
            )
        )
        .unique()
        .all()
    )
    return {"videos": [video_to_schema(video).model_dump() for video in videos]}


@app.patch("/admin/content/{video_id:int}", response_model=VideoOut)
def update_content_status(
    video_id: int,
    payload: ModerationStatusUpdate,
    db: Session = Depends(get_db),
) -> VideoOut:
    video = db.scalar(select(Video).options(joinedload(Video.author)).where(Video.id == video_id))
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    video.content_status = payload.content_status
    db.add(video)
    db.commit()
    db.refresh(video)
    return video_to_schema(video)
