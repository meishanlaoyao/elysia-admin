FROM oven/bun:1-debian AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY tsconfig.json ./
RUN bun install --frozen-lockfile

COPY script ./script
COPY src ./src
COPY database/base-schema.ts ./database/base-schema.ts
COPY database/schema ./database/schema
COPY public ./public

ENV NODE_ENV=production
RUN bun run build

FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app/dist

COPY --from=build /app/dist ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "trap 'kill -TERM $(jobs -p) 2>/dev/null; wait' TERM INT; bun run workers.js & bun run index.js & wait"]