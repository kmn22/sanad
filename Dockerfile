FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate && npm run build
RUN cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/

FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/.next/standalone ./
RUN mkdir -p /app/db
ENV PORT=3001 HOSTNAME="0.0.0.0" NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
