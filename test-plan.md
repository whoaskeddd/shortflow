# ShortFlow Test Plan

## Source
- Task: собрать production-ready MVP ShortFlow с profanity-only AI-модерацией
- Plan file: `C:\develop\shortflow\plan.md`
- Status file: `C:\develop\shortflow\status.md`
- Repo context: `C:\develop\shortflow`
- Last updated: 2026-04-28

## Validation Scope
- In scope: backend auth/profile/video/feed/social/search/notification flows, profanity-only moderation for text and video audio, approved-only public visibility rules, mobile navigation/state/UI contracts, local video picker/upload flow, DX/infra docs and compose, optimized Docker build context and local/hybrid launch docs.
- Out of scope: manual review queue, multilingual moderation beyond Russian, live streaming, direct messages, duet/stitch, monetization, advanced ML ranking.

## Environment / Fixtures
- Data fixtures: demo users, demo videos, comments, follows, notifications.
- External dependencies: PostgreSQL, Redis, MinIO/S3-compatible storage, Expo toolchain.
- Setup assumptions: `.env` files derived from examples, Docker available for full local backend stack.

## Test Levels

### Unit
- Backend domain/service tests for auth, feed ranking fallback, likes/saves/comments/follows.
- Backend text moderation service tests for classifier-based profanity rejection.
- Mobile store and formatter helpers.

### Integration
- FastAPI endpoint tests with database session lifecycle.
- Storage service contract tests for local/S3-ready adapter boundaries.
- FastAPI moderation tests for rejected title/comment/video transcript and approved-only feed/search/comments visibility.
- Mobile API client contract verification against typed response models.

### End-to-End / Smoke
- Register -> login -> get profile.
- Publish video metadata -> fetch `For You` feed -> like/save/comment/follow.
- Publish profanity-free video -> success.
- Publish/comment with profanity -> receive `422` moderation error.
- Open mobile app -> auth flow -> browse feed -> open comments -> profile -> search.

## Negative / Edge Cases
- Duplicate registration email.
- Invalid/expired JWT access token.
- Unauthorized profile/video mutation.
- Empty feed and empty search state.
- Video publish request without required fields.
- Video publish with profanity in title, hashtags, or transcript.
- Comment with profanity.
- Comment deletion by non-owner.

## Acceptance Gates
- [ ] `docker compose config`
- [ ] `python -m ruff check apps/api`
- [ ] `pytest apps/api/tests`
- [ ] `npm run lint --workspace @shortflow/mobile`
- [ ] `npm run typecheck --workspace @shortflow/mobile`
- [ ] `npm run validate`

## Release / Demo Readiness
- [ ] Core scenario works end to end
- [ ] Primary regression checks are green
- [ ] No blocker-level known issue remains
- [ ] Demo steps are reproducible

## Command Matrix
```sh
docker compose config
python -m ruff check apps/api
pytest apps/api/tests
npm run lint --workspace @shortflow/mobile
npm run typecheck --workspace @shortflow/mobile
npm run validate
docker compose up --build
```

## Open Risks
- Full backend runtime cannot be validated until `pytest` and project Python dependencies are installed in the environment.
- Real device video capture/playback performance is not measurable without installing dependencies and running on emulator/device.
- Whisper model download and first-run latency are not measurable in the current offline environment.
- Mobile static checks cannot be rerun until workspace JS dependencies are installed.

## Deferred Coverage
- Manual moderation queue / admin review workflow for comments and videos.
- Push notifications delivery transport.
- Production object storage credentials rotation and CDN behavior.
