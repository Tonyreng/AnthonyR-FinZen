# syntax=docker/dockerfile:1.7
FROM python:3.11-slim-bookworm@sha256:0a310eeecf4e1f5a0743f9a6520c90c88d089c903ca5fd283f501e3a805f5f89 AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    VIRTUAL_ENV=/opt/venv

RUN python -m venv "$VIRTUAL_ENV"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /build
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install --requirement requirements.txt

FROM python:3.11-slim-bookworm@sha256:0a310eeecf4e1f5a0743f9a6520c90c88d089c903ca5fd283f501e3a805f5f89 AS runtime-base

ARG VERSION=dev
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="FinZen backend" \
    org.opencontainers.image.description="Flask API for FinZen" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.source="https://github.com/Tonyreng/AnthonyR-FinZen"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    FLASK_APP=app.py \
    PORT=5000

RUN groupadd --gid 10001 finzen \
    && useradd --uid 10001 --gid finzen --create-home --shell /usr/sbin/nologin finzen

WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY --chown=finzen:finzen backend/ ./
RUN mkdir -p /app/logs && chown -R finzen:finzen /app

USER finzen
EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/api/ready', timeout=2)" || exit 1

FROM runtime-base AS development
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]

FROM runtime-base AS test
USER root
RUN pip install --requirement requirements-dev.txt
USER finzen
CMD ["pytest", "-q", "tests"]

FROM runtime-base AS production
CMD ["gunicorn", "--bind=0.0.0.0:5000", "--workers=2", "--threads=4", "--timeout=30", "app:app"]
