# syntax=docker/dockerfile:1.5
FROM node:20-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

# ca-certificates + python3/make/g++ for node-gyp (native addons e.g. cld in shared deps)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates openssl \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

RUN pnpm config set node-linker=isolated

# Install only what's needed for the web app
RUN pnpm --filter web... \
  --filter @repo/utils-core... \
  --filter @repo/ui... \
  --filter @repo/trpc... \
  --filter @repo/typescript-config... \
  install --frozen-lockfile --prod=false

RUN pnpm --filter @repo/utils-core build

# Build Next.js using BuildKit secret (WEB_ENV_FILE in docker-compose.prod.yml)
RUN --mount=type=secret,id=web_env \
  test -f /run/secrets/web_env \
  && set -a \
  && . /run/secrets/web_env \
  && set +a \
  && pnpm --filter web build

WORKDIR /app/apps/web

CMD ["pnpm", "exec", "next", "start", "-p", "3000"]
