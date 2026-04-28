# ShortFlow Architecture

## Monorepo boundaries

- `apps/api` owns domain logic, persistence, auth, and REST contracts.
- `apps/mobile` owns native UX, navigation, offline-friendly client state, and API consumption.
- Root docs (`plan.md`, `status.md`, `test-plan.md`) are the first resume points for any future run.

## Backend design

- FastAPI app with modular routers and SQLAlchemy models.
- Stateless JWT access/refresh tokens.
- Local file upload adapter now, S3-ready settings included for future swap.
- Profanity-only moderation is enforced on text fields and video audio before publish.
- Public read paths expose only `approved` videos/comments.

## Mobile design

- Expo/React Native app with React Navigation.
- Zustand for auth/session and lightweight UI state.
- Theme tokens shared through a small design system layer.
- Feed UI optimized for vertical full-screen browsing.

## AI moderation flow

- Text moderation uses the Russian model `cointegrated/rubert-tiny-toxicity` and blocks only by its `obscenity` score for `title`, `description`, `hashtags`, and comments.
- Video moderation extracts audio with `ffmpeg`, transcribes it with `faster-whisper`, and reuses the same text classifier on the transcript.
- Rejected publish attempts do not create DB records; local uploads are removed on moderation failure.
- Existing `content_status` and admin routes remain the insertion point for any later manual review workflow.
