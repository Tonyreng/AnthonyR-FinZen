# syntax=docker/dockerfile:1.7
FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS dependencies

ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM dependencies AS development
COPY frontend/ ./
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

FROM dependencies AS test
COPY frontend/ ./
CMD ["pnpm", "test:run"]

FROM dependencies AS build
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
COPY frontend/ ./
RUN pnpm build

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:782bb89768cc87b7f95c18b95baa1af250e5d451f26794f59363540161147c01 AS production

ARG VERSION=dev
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="FinZen frontend" \
    org.opencontainers.image.description="React web client for FinZen" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.source="https://github.com/Tonyreng/AnthonyR-FinZen"
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
    CMD wget --quiet --output-document=- http://127.0.0.1:8080/ >/dev/null || exit 1
