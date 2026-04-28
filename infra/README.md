# Infra Notes

- `docker-compose.yml` provides the local stack for PostgreSQL, Redis, MinIO, and the API container.
- Profanity-only AI moderation runs inside the API container and requires `ffmpeg` plus the Python whisper dependency.
- A separate moderation worker/queue is still not part of the local stack.
