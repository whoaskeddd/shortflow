# ShortFlow Test Plan

## Source
- Task: собрать production-ready MVP ShortFlow без AI-модерации
- Plan file: `C:\develop\shortflow\plan.md`
- Status file: `C:\develop\shortflow\status.md`
- Repo context: `C:\develop\shortflow`
- Last updated: 2026-04-27

## Validation Scope
- In scope: backend auth/profile/video/feed/social/search/notification flows, mobile navigation/state/UI contracts, mobile safe-area/layout polish, local video picker/upload flow, DX/infra docs and compose.
- Out of scope: AI moderation pipeline, live streaming, direct messages, duet/stitch, monetization, advanced ML ranking.

## Environment / Fixtures
- Data fixtures: demo users, demo videos, comments, follows, notifications.
- External dependencies: PostgreSQL, Redis, MinIO/S3-compatible storage, Expo toolchain.
- Setup assumptions: `.env` files derived from examples, Docker available for full local backend stack.

## Test Levels

### Unit
- Backend domain/service tests for auth, feed ranking fallback, likes/saves/comments/follows.
- Mobile store and formatter helpers.

### Integration
- FastAPI endpoint tests with database session lifecycle.
- Storage service contract tests for local/S3-ready adapter boundaries.
- Mobile API client contract verification against typed response models.

### End-to-End / Smoke
- Register -> login -> get profile.
- Publish video metadata -> fetch `For You` feed -> like/save/comment/follow.
- Open mobile app -> auth flow -> browse feed -> open comments -> profile -> search.

## Negative / Edge Cases
- Duplicate registration email.
- Invalid/expired JWT access token.
- Unauthorized profile/video mutation.
- Empty feed and empty search state.
- Video publish request without required fields.
- Comment deletion by non-owner.

## Acceptance Gates
- [ ] `python -m ruff check apps/api`
- [ ] `pytest apps/api/tests`
- [x] `npm run lint --workspace @shortflow/mobile`
- [x] `npm run typecheck --workspace @shortflow/mobile`
- [x] `npm run validate`

## Release / Demo Readiness
- [ ] Core scenario works end to end
- [ ] Primary regression checks are green
- [ ] No blocker-level known issue remains
- [ ] Demo steps are reproducible

## Command Matrix
```sh
python -m ruff check apps/api
pytest apps/api/tests
npm run lint --workspace @shortflow/mobile
npm run typecheck --workspace @shortflow/mobile
npm run validate
docker compose up --build
```

## Open Risks
- Backend runtime cannot be fully validated until Python launcher is available in the environment.
- Real device video capture/playback performance is not measurable without installing dependencies and running on emulator/device.
- Current backend tests cover smoke/auth basics only and should be expanded once Python execution is available.

## Deferred Coverage
- AI moderation status machine and admin review queue.
- Push notifications delivery transport.
- Production object storage credentials rotation and CDN behavior.
