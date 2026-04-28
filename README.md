# ShortFlow

## Стек проекта

- Mobile: React Native + Expo + TypeScript + React Navigation + Zustand
- Backend: Python + FastAPI + SQLAlchemy
- Data: PostgreSQL + Redis
- Storage: MinIO / S3-compatible storage
- Infra: Docker Compose
- Tooling: ESLint + TypeScript + Pytest + Ruff

ShortFlow — mobile-first MVP приложения коротких вертикальных видео в духе TikTok.

В этой версии проверка проекта ориентирована на Android Studio и Android Emulator.

## Что уже реализовано

- регистрация и вход
- профиль пользователя
- локальная публикация ролика с AI-проверкой аудио
- лента `Для вас`
- лента `Подписки`
- лайки, сохранения, репосты
- комментарии
- поиск
- активность / уведомления
- profanity-only AI-модерация для title, description, hashtags, comments и аудиодорожки видео
  на базе русской модели токсичности с использованием только сигнала `obscenity`
- splash screen и skeleton loading
- mobile UI на русском языке

## Что пока не входит

- direct messages
- live streaming
- duet / stitch
- сложная ML-рекомендация

## Структура проекта

```text
apps/
  api/
  mobile/
docs/
infra/
plan.md
status.md
test-plan.md
```

## Проверка в Android Studio

### 1. Что должно быть установлено

- Docker Desktop
- Node.js 24+
- Android Studio
- Android SDK
- Android Emulator

### 2. Поднять backend

Из корня проекта:

```powershell
cd C:\develop\shortflow
docker compose down -v
docker compose up --build
```

После запуска проверьте:

- `http://127.0.0.1:8000/health`

Ожидаемый ответ:

```json
{"status":"ok"}
```

Что важно для AI-модерации:

- `apps/api/Dockerfile` уже устанавливает `ffmpeg`, он нужен для извлечения аудио из видео.
- Backend читает настройки из `apps/api/.env.example`, AI-модерация там включена по умолчанию.
- При первом реальном moderation-запросе backend скачает `faster-whisper` и `cointegrated/rubert-tiny-toxicity` в локальный кэш.
- Первая проверка видео или текста может быть медленнее обычного из-за первичной загрузки моделей.

Ключевые env-переменные AI-модерации:

```powershell
APP_MODERATION_ENABLED=true
APP_MODERATION_LANGUAGE=ru
APP_MODERATION_WHISPER_MODEL=base
APP_MODERATION_MAX_VIDEO_SECONDS=180
APP_MODERATION_TEXT_MODEL_ID=cointegrated/rubert-tiny-toxicity
APP_MODERATION_TEXT_MODEL_REVISION=fd5e387
APP_MODERATION_OBSCENITY_THRESHOLD=0.5
```

### 3. Подготовить Android Studio

1. Откройте Android Studio
2. Перейдите в `Device Manager`
3. Создайте или запустите Android Emulator
4. Дождитесь полной загрузки эмулятора

Важно:

- mobile client уже настроен на backend URL `http://10.0.2.2:8000`
- `10.0.2.2` — это правильный адрес хоста для Android Emulator

### 4. Установить mobile зависимости

Из папки mobile:

```powershell
cd C:\develop\shortflow\apps\mobile
npm install
```

### 5. Проверить статическую корректность

```powershell
npm run lint
npm run typecheck
```

### 6. Запустить приложение на Android Emulator

```powershell
npx expo start
```

После запуска:

- нажмите `a` в терминале

Или можно сразу:

```powershell
npx expo run:android
```

## Сценарий ручной проверки

После запуска приложения на эмуляторе проверьте:

1. Появляется splash screen
2. После него открывается экран входа
3. Можно зарегистрировать нового пользователя
4. После входа открывается лента
5. Во время загрузки виден skeleton loading
6. Можно открыть вкладку `Публикация` и добавить ролик
7. После публикации ролик появляется в ленте
8. Кнопка лайка пульсирует и счетчик меняется плавно
9. Можно открыть комментарии и отправить комментарий
10. Мат в title/comment отклоняется понятной ошибкой
11. Мат в аудиодорожке видео не дает опубликовать ролик
12. Работают вкладки `Поиск`, `Активность`, `Профиль`

## Полезные команды

Из корня проекта:

```powershell
npm run validate
docker compose up --build
```

Из `apps/mobile`:

```powershell
npm run lint
npm run typecheck
npx expo start
npx expo run:android
```

Из `apps/api` при локальной Python-проверке:

```powershell
pip install -e .[dev]
uvicorn app.main:app --host 0.0.0.0 --port 8000
pytest tests
python -m ruff check app tests
```

Если запускаете backend не через Docker, установите `ffmpeg` отдельно в систему, иначе модерация видео не сможет извлечь аудио.

## Примечания

- Текущая mobile-конфигурация ориентирована именно на Android Emulator.
- Если захотите запускать на физическом Android-устройстве, `API_URL` в [client.ts](/C:/develop/shortflow/apps/mobile/src/api/client.ts) нужно будет переключить на IP вашей машины в локальной сети.
- Web-версия из проекта удалена, текущий основной контур проверки — только mobile.
