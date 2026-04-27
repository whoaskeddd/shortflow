# ShortFlow Plan

## Source
- Task: разработать production-ready MVP ShortFlow по `tech.md` и исходному плану, исключив AI-модерацию до отдельного этапа.
- Canonical input: `C:\develop\shortflow\tech.md`
- Repo context: новый монорепозиторий `backend + mobile + infra`
- Last updated: 2026-04-27

## Assumptions
- AI-модерация и очередь ручной модерации откладываются, но доменная модель допускает их добавление позже без ломающих миграций.
- Для MVP допустим общий монорепозиторий с `apps/api` и `apps/mobile`.
- Backend должен быть готов к PostgreSQL/Redis/S3, но локально поддерживать упрощенный запуск через Docker Compose.
- Mobile-часть будет собрана на Expo + React Native + TypeScript для ускоренного iOS/Android MVP.
- Поскольку репозиторий пустой, источником возобновления контекста будут `plan.md`, `status.md`, `test-plan.md`, `README.md`.

## Validation Assumptions
- Backend lint: `python -m ruff check apps/api`
- Backend tests: `pytest apps/api/tests`
- Mobile typecheck: `npm run typecheck --workspace @shortflow/mobile`
- Mobile lint: `npm run lint --workspace @shortflow/mobile`
- Repo build checks: `npm run validate`
- В текущей среде Python launcher недоступен, поэтому backend-проверки могут быть неисполняемы локально до настройки интерпретатора.

## Milestone Order
| ID | Title | Depends on | Status |
| --- | --- | --- | --- |
| M1 | Durable planning and repo foundation | - | [x] |
| M2 | FastAPI backend MVP without AI moderation | M1 | [~] |
| M3 | React Native mobile MVP | M1 | [x] |
| M4 | Shared infrastructure and developer experience | M2, M3 | [x] |
| M5 | Validation, docs, and handoff | M2, M3, M4 | [~] |
| M6 | Mobile polish: smooth motion, safe areas, local video picker | M3 | [~] |

## M6. Mobile polish: smooth motion, safe areas, local video picker `[~]`
### Goal
- Убрать резкие визуальные переходы, выровнять mobile safe-area/отступы и перевести публикацию ролика на выбор локального файла с телефона или ПК.

### Tasks
- [ ] Перевести shared layout и tab bar на safe-area-aware отступы.
- [ ] Смягчить loading/feedback-анимации без резких миганий.
- [ ] Заменить ручной ввод URL на системный выбор локального видеофайла и multipart upload.
- [ ] Прогнать mobile lint/typecheck и зафиксировать результат в execution docs.

### Definition of Done
- Ключевые мобильные экраны не залезают под системное время, батарею и home indicator.
- Видео выбирается через системный picker и загружается в API как файл.
- Splash/skeleton/press feedback воспринимаются плавно и без вспышек.

### Validation
```sh
npm run lint --workspace @shortflow/mobile
npm run typecheck --workspace @shortflow/mobile
```

## M1. Durable planning and repo foundation `[x]`
### Goal
- Зафиксировать рабочий execution pack и подготовить структуру монорепозитория для дальнейшей разработки без потери контекста.

### Tasks
- [x] Перенести исходный продуктовый план в исполнимый `plan.md`.
- [x] Создать `status.md` как журнал исполнения и восстановления контекста.
- [x] Создать `test-plan.md` с реальными acceptance gates.
- [x] Создать базовую структуру каталогов `apps/api`, `apps/mobile`, `infra`, `docs`.

### Definition of Done
- План, статус и тестовый план существуют и отражают текущее состояние проекта.
- Структура репозитория соответствует монорепозиторию для backend/mobile/infra.

### Validation
```sh
Get-ChildItem
Get-ChildItem apps
```

### Known Risks
- Репозиторий стартует с нуля, поэтому часть решений будет зафиксирована как архитектурные допущения.

### Stop-and-Fix Rule
- Если структура репозитория или execution docs не согласованы между собой, сначала выровнять документы и только потом продолжать код.

## M2. FastAPI backend MVP without AI moderation `[~]`
### Goal
- Поднять backend API для auth, profiles, videos, feeds, follows, likes, saves, reposts, comments, search, notifications и базовой admin-ready модели moderation status без AI pipeline.

### Tasks
- [x] Настроить Python-проект, конфиг, зависимости и env-шаблоны.
- [x] Реализовать SQLAlchemy модели и связи домена.
- [x] Реализовать auth с access/refresh JWT и hash паролей.
- [x] Реализовать REST endpoints из MVP-объема без AI moderation endpoints.
- [x] Реализовать storage abstraction для локального файла и S3-ready конфигурации.
- [~] Добавить тесты на ключевые сценарии auth/feed/social graph.

### Definition of Done
- API покрывает основной MVP-объем backend.
- Сущности и схемы допускают позднее подключение AI moderation без breaking changes.
- Есть инструкция локального запуска через Docker Compose.

### Validation
```sh
pytest apps/api/tests
python -m ruff check apps/api
```

### Known Risks
- Отсутствие рабочего Python launcher в текущей среде может ограничить локальную валидацию.
- Реальный upload вертикального видео потребует интеграции с S3/MinIO и клиентской камеры на устройстве.

### Stop-and-Fix Rule
- Если ломается auth, миграции моделей или контракты feed endpoints, не переходить к mobile-интеграции до исправления.

## M3. React Native mobile MVP `[x]`
### Goal
- Реализовать mobile-клиент с auth flow, вертикальной лентой, профилем, поиском, upload screen, комментариями, уведомлениями и светлой/темной темой.

### Tasks
- [x] Настроить Expo/React Native + TypeScript + React Navigation + Zustand.
- [x] Создать design tokens, theme provider и reusable UI primitives.
- [x] Реализовать auth flow и хранение токенов.
- [x] Реализовать feed screen с вертикальным видео UX и действиями пользователя.
- [x] Реализовать profile, search, notifications, upload и comments flow.
- [x] Подключить API client и optimistic UI для лайков/подписок/сохранений.

### Definition of Done
- Приложение собирается как MVP-клиент для iOS и Android.
- Основные пользовательские сценарии отражают ТЗ и готовы к подключению реального backend.

### Validation
```sh
npm run typecheck --workspace @shortflow/mobile
npm run lint --workspace @shortflow/mobile
```

### Known Risks
- Без установки зависимостей и эмуляторов локально будет проверена только статическая корректность исходников и конфигов.

### Stop-and-Fix Rule
- Если навигация, theme system или API contracts расходятся с backend, исправить слой интеграции до добавления полировки.

## M4. Shared infrastructure and developer experience `[x]`
### Goal
- Подготовить локальную инфраструктуру и DX: Docker Compose, env examples, CI, README, стандарты запуска.

### Tasks
- [x] Добавить `docker-compose.yml` с Postgres, Redis, MinIO и API.
- [x] Добавить root workspace scripts для lint/typecheck/validate.
- [x] Добавить GitHub Actions для backend и mobile.
- [x] Подготовить `README.md` и архитектурную документацию.

### Definition of Done
- Новый разработчик может понять структуру проекта и поднять окружение без чтения чата.

### Validation
```sh
npm run validate
```

### Known Risks
- CI для Python нельзя полностью подтвердить в текущей среде без доступного интерпретатора.

### Stop-and-Fix Rule
- Если scripts/CI/docs описывают разные команды запуска, сначала унифицировать DX.

## M5. Validation, docs, and handoff `[~]`
### Goal
- Зафиксировать проверенное состояние, ограничения среды и следующие шаги.

### Tasks
- [~] Прогнать доступные локальные проверки.
- [x] Обновить `status.md` и `test-plan.md` фактическими результатами.
- [x] Зафиксировать open risks и post-MVP этап подключения AI moderation.

### Definition of Done
- Есть прозрачная картина: что реализовано, что проверено, что осталось на следующий проход.

### Validation
```sh
Get-Content status.md
Get-Content test-plan.md
```

### Known Risks
- Часть валидации может остаться теоретической, если среда не дает выполнить backend-команды.

### Stop-and-Fix Rule
- Если фактический статус и документы расходятся, сначала обновить документы, затем завершать работу.
