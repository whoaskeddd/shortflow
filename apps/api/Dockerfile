FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /tmp/pyproject.toml

RUN python -m pip install --upgrade pip \
    && python -c "import subprocess, sys, tomllib; data = tomllib.load(open('/tmp/pyproject.toml', 'rb')); subprocess.check_call([sys.executable, '-m', 'pip', 'install', *data['project']['dependencies']])"

COPY app /app/app

RUN mkdir -p /app/data/uploads

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
