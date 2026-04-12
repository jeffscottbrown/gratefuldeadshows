# ── Install dependencies ──────────────────────────────────────────────────────
FROM node:22-slim AS deps
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone output bundle
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# SQLite database
COPY --from=builder /app/db/gratefuldata.db ./db/gratefuldata.db

# better-sqlite3 native module (needed by standalone runtime)
COPY --from=deps /app/node_modules/better-sqlite3    ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/bindings           ./node_modules/bindings
COPY --from=deps /app/node_modules/file-uri-to-path   ./node_modules/file-uri-to-path

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
