FROM postgres:16-bookworm AS postgres-tools

FROM node:26-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate && npm run build
RUN cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

FROM node:26-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl libpq5 libzstd1 liblz4-1 && rm -rf /var/lib/apt/lists/*
COPY --from=postgres-tools /usr/lib/postgresql/16/bin/pg_dump /usr/local/bin/pg_dump
COPY --from=builder /app/.next/standalone ./
# Copy Prisma schema + migrations so `prisma migrate deploy` works at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
RUN mkdir -p /app/db
ENV PORT=3001 HOSTNAME="0.0.0.0" NODE_ENV=production

# Entrypoint: run DB migrations before starting the server.
# `prisma migrate deploy` is idempotent — safe on every restart.
# Never use `db push` in production: it can silently drop columns.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]

