# ShortFlow

Демо-видео: [shortflowfull.mp4](https://github.com/whoaskeddd/portfolio/blob/main/assets/videos/shortflowfull.mp4)


## О проекте
ShortFlow — mobile-first приложение коротких видео (React Native + Expo) с backend на FastAPI.

## Стек
- Frontend: React Native, Expo, TypeScript
- Backend: FastAPI, SQLAlchemy
- Инфраструктура: PostgreSQL, Redis, MinIO, Docker Compose

## Структура
- `apps/mobile` — мобильный клиент (frontend)
- `apps/api` — backend API
- `docker-compose.yml` — инфраструктура + API

## Требования
- Node.js 20+
- npm
- Python 3.12+
- Docker Desktop
- Android Studio + Emulator (для Android запуска)

## Запуск backend (Docker, рекомендуемый)
```powershell
cd C:\develop\portfolio\repos\shortflow
docker compose up --build
```
Проверка:
- API: `http://127.0.0.1:8000/health`
- MinIO Console: `http://127.0.0.1:9001`

## Запуск backend (локально, без Docker)
```powershell
cd C:\develop\portfolio\repos\shortflow\apps\api
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e .[dev]
copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Запуск frontend (mobile)
```powershell
cd C:\develop\portfolio\repos\shortflow
npm install
cd apps\mobile
npm install
npx expo start
```
Для Android Emulator нажмите `a` в терминале Expo.

Альтернатива:
```powershell
cd C:\develop\portfolio\repos\shortflow\apps\mobile
npx expo run:android
```

## Использование функций
После входа в приложение доступны основные сценарии:
- Регистрация и логин
- Лента видео (`Для вас` и `Подписки`)
- Лайки, комментарии, сохранения, репосты
- Поиск
- Уведомления
- Публикация ролика
- Модерация контента (текст + аудио дорожка видео)

## Полезные команды
Frontend/mobile:
```powershell
cd C:\develop\portfolio\repos\shortflow\apps\mobile
npm run lint
npm run typecheck
```

Backend:
```powershell
cd C:\develop\portfolio\repos\shortflow\apps\api
pytest tests
python -m ruff check app tests
```


