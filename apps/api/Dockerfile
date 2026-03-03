FROM node:20-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

# Needed for Prisma + HTTPS downloads during install
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy the whole monorepo
COPY . .

RUN pnpm config set node-linker=isolated

# Install only what's needed to build the API
RUN pnpm --filter api... \
  --filter @repo/utils-core... \
  --filter @repo/prisma-db... \
  install --frozen-lockfile --prod=false

WORKDIR /app/apps/api
RUN pnpm --filter api exec prisma generate --schema ../../packages/prisma-db/schema.prisma

WORKDIR /app
RUN pnpm --filter @repo/utils-core build
RUN pnpm --filter api build

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=4000

# Nest output per nest-cli.json outDir
CMD ["node", "dist/apps/api/src/main.js"]
