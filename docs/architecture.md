# ShortFlow Architecture

## Monorepo boundaries

- `apps/api` owns domain logic, persistence, auth, and REST contracts.
- `apps/mobile` owns native UX, navigation, offline-friendly client state, and API consumption.
- Root docs (`plan.md`, `status.md`, `test-plan.md`) are the first resume points for any future run.

## Backend design

- FastAPI app with modular routers and SQLAlchemy models.
- Stateless JWT access/refresh tokens.
- Local file upload adapter now, S3-ready settings included for future swap.
- Manual moderation-ready `content_status` field already exists on publishable entities.

## Mobile design

- Expo/React Native app with React Navigation.
- Zustand for auth/session and lightweight UI state.
- Theme tokens shared through a small design system layer.
- Feed UI optimized for vertical full-screen browsing.

## Deferred AI moderation insertion point

Later AI moderation can hook into:

- `Video.content_status`
- `Comment.content_status`
- `Notification` fan-out for review results
- admin routes for queue/review actions

No existing public contract needs to be broken to add the moderation workflow later.
