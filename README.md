# ShortFlow

ShortFlow — mobile-first MVP приложения коротких вертикальных видео в духе TikTok.

Стек:

- `apps/api` — FastAPI backend
- `apps/mobile` — React Native / Expo mobile client
- `docker-compose.yml` — локальная инфраструктура для backend

В этой версии проверка проекта ориентирована на Android Studio и Android Emulator.

## Что уже реализовано

- регистрация и вход
- профиль пользователя
- публикация ролика по URL
- лента `Для вас`
- лента `Подписки`
- лайки, сохранения, репосты
- комментарии
- поиск
- активность / уведомления
- splash screen и skeleton loading
- mobile UI на русском языке

## Что пока не входит

- AI-модерация
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
10. Работают вкладки `Поиск`, `Активность`, `Профиль`

## Полезные команды

Из корня проекта:

```powershell
npm run validate
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
pytest tests
python -m ruff check app tests
```

## Примечания

- Текущая mobile-конфигурация ориентирована именно на Android Emulator.
- Если захотите запускать на физическом Android-устройстве, `API_URL` в [client.ts](/C:/develop/shortflow/apps/mobile/src/api/client.ts) нужно будет переключить на IP вашей машины в локальной сети.
- Web-версия из проекта удалена, текущий основной контур проверки — только mobile.
