# ShortFlow Status

## Snapshot
- Current phase: M5. Validation, docs, and profanity moderation handoff
- Plan file: `C:\develop\shortflow\plan.md`
- Status: yellow
- Last updated: 2026-04-28

## Done
- Прочитаны и учтены `tech.md` и исходный `plan.md`.
- Выбран монорепозиторий `apps/api + apps/mobile + infra`.
- Созданы `apps/api`, `apps/mobile`, `infra`, `docs`, `README.md`, `docker-compose.yml`, GitHub Actions.
- Собран backend MVP на FastAPI с auth, profiles, videos, feed, follows, reactions, comments, search, notifications и admin-ready content status.
- Собран mobile MVP на Expo/React Native с auth flow, feed, search, upload, notifications, profile и theme system.
- Добавлена profanity-only AI-модерация для текста и аудиодорожки видео на backend, плюс approved-only фильтрация публичных read endpoints.
- Обновлены backend tests под moderation-кейсы и mobile API error parsing.

## In Progress
- Полный прогон backend/mobile validation после установки Python/Node dev-зависимостей в окружении.

## Next
- Установить backend/mobile зависимости и прогнать `python3 -m pytest apps/api/tests`, `python -m ruff check apps/api`, `npm run typecheck --workspace @shortflow/mobile`.

## Decisions Made
- Mobile стек: Expo + React Native + TypeScript + React Navigation + Zustand.
- Backend стек: FastAPI + SQLAlchemy + PostgreSQL + Redis-ready + S3-ready storage abstraction.
- Для v1 включена только profanity-only AI moderation: текст проверяется локально, видео модерируется синхронно через `ffmpeg + faster-whisper`.
- Основным механизмом сохранения контекста между проходами считаются `plan.md`, `status.md`, `test-plan.md`, `README.md`.

## Assumptions In Force
- В окружении есть `python3`, но `pytest` и JS toolchain из `node_modules` пока не установлены, поэтому validation упирается в отсутствующие dev-зависимости.
- Whisper model будет скачана при первом реальном вызове video moderation в окружении с сетью/кэшем.

## Commands
```sh
node --version
npm --version
python3 --version
python3 -m compileall apps/api/app apps/api/tests
python3 -m pytest apps/api/tests
npm run validate
```

## Current Blockers
- В окружении отсутствует `pytest` для Python и `tsc` из локальных mobile dependencies.

## Audit Log
| Date | Milestone | Files | Commands | Result | Next |
| --- | --- | --- | --- | --- | --- |
| 2026-04-26 | M1 | `tech.md`, `plan.md`, `status.md` | `Get-Content tech.md`, `Get-Content plan.md`, `node --version`, `npm --version` | partial pass | создать `test-plan.md` и кодовую базу |
| 2026-04-26 | M2-M4 | `apps/api`, `apps/mobile`, `docker-compose.yml`, `README.md` | `npm install`, `npm run lint --workspace @shortflow/mobile`, `npm run typecheck --workspace @shortflow/mobile`, `npm run validate` | mobile pass / backend pending | разблокировать Python и прогнать backend checks |
| 2026-04-28 | M2-M5 | `apps/api/app/moderation`, `apps/api/tests`, `apps/mobile/src/api/client.ts`, `README.md` | `python3 --version`, `python3 -m compileall apps/api/app apps/api/tests`, `python3 -m pytest apps/api/tests`, `npm run typecheck --workspace @shortflow/mobile` | compile pass / pytest missing / tsc missing | установить dev-зависимости и прогнать полный validation |

## Smoke / Demo Checklist/ущем окружении
- [x] Core auth/feed/profile flow покрыт кодом и документацией
