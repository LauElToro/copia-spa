# syntax=docker/dockerfile:1
# Optimizado: standalone output (sin yarn en prod) + cache mounts
FROM node:20.12.2-alpine AS builder

WORKDIR /app

# Declarar ARGs para variables de entorno de build
ARG NEXT_PUBLIC_MS_AUTH_URL
ARG NEXT_PUBLIC_MS_ACCOUNT_URL
ARG NEXT_PUBLIC_MS_PLANS_URL
ARG NEXT_PUBLIC_MS_STORAGE_URL
ARG NEXT_PUBLIC_MS_TRANSACTIONS_URL
ARG NEXT_PUBLIC_MS_PRODUCTS_URL
ARG NEXT_PUBLIC_MS_NOTIFICATIONS_URL
ARG NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL
ARG NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL
ARG NEXT_PUBLIC_MS_STORES_URL
ARG NEXT_PUBLIC_MS_WALLETS_URL
ARG NEXT_PUBLIC_MS_PAYMENTS_URL
ARG NEXT_PUBLIC_MS_SHIPPINGS_URL
ARG NEXT_PUBLIC_WSS_URL
ARG NEXT_PUBLIC_LIBIA_API_URL
ARG NEXT_PUBLIC_S3_BASE_URL
ARG NEXT_PUBLIC_BFF_API_URL
ARG NEXT_PUBLIC_USE_BFF_PROXY
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXTAUTH_SECRET
ARG API_PREFIX=/api/v1

# Exportar como variables de entorno para el build
ENV NEXT_PUBLIC_BFF_API_URL=$NEXT_PUBLIC_BFF_API_URL
ENV NEXT_PUBLIC_MS_AUTH_URL=$NEXT_PUBLIC_MS_AUTH_URL
ENV NEXT_PUBLIC_MS_ACCOUNT_URL=$NEXT_PUBLIC_MS_ACCOUNT_URL
ENV NEXT_PUBLIC_MS_PLANS_URL=$NEXT_PUBLIC_MS_PLANS_URL
ENV NEXT_PUBLIC_MS_STORAGE_URL=$NEXT_PUBLIC_MS_STORAGE_URL
ENV NEXT_PUBLIC_MS_TRANSACTIONS_URL=$NEXT_PUBLIC_MS_TRANSACTIONS_URL
ENV NEXT_PUBLIC_MS_PRODUCTS_URL=$NEXT_PUBLIC_MS_PRODUCTS_URL
ENV NEXT_PUBLIC_MS_NOTIFICATIONS_URL=$NEXT_PUBLIC_MS_NOTIFICATIONS_URL
ENV NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL=$NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL
ENV NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL=$NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL
ENV NEXT_PUBLIC_MS_STORES_URL=$NEXT_PUBLIC_MS_STORES_URL
ENV NEXT_PUBLIC_MS_WALLETS_URL=$NEXT_PUBLIC_MS_WALLETS_URL
ENV NEXT_PUBLIC_MS_PAYMENTS_URL=$NEXT_PUBLIC_MS_PAYMENTS_URL
ENV NEXT_PUBLIC_MS_SHIPPINGS_URL=$NEXT_PUBLIC_MS_SHIPPINGS_URL
ENV NEXT_PUBLIC_WSS_URL=$NEXT_PUBLIC_WSS_URL
ENV NEXT_PUBLIC_LIBIA_API_URL=$NEXT_PUBLIC_LIBIA_API_URL
ENV NEXT_PUBLIC_S3_BASE_URL=$NEXT_PUBLIC_S3_BASE_URL
ENV NEXT_PUBLIC_USE_BFF_PROXY=$NEXT_PUBLIC_USE_BFF_PROXY
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV API_PREFIX=$API_PREFIX
ENV NEXT_PUBLIC_API_PREFIX=$API_PREFIX

# Copiar archivos de dependencias (orden: deps primero = mejor cache)
COPY package.json yarn.lock ./

# Cache mount: evita re-descargar en builds subsiguientes
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --network-timeout 300000 --ignore-scripts --ignore-engines

# Copiar archivos de configuración
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

# Copiar código fuente
COPY src ./src
COPY public ./public

# Cache mount .next/cache: compilación incremental ~2-4x más rápida
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN --mount=type=cache,target=/app/.next/cache \
    yarn build

# Production stage - standalone: sin yarn install, ~80% más rápido
FROM node:20.12.2-alpine AS production

WORKDIR /app

# Instalar wget para healthcheck
RUN apk add --no-cache wget

ARG API_PREFIX=/api/v1
ENV API_PREFIX=$API_PREFIX
ENV NEXT_PUBLIC_API_PREFIX=$API_PREFIX

# Crear usuario sin privilegios
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar output standalone (incluye server.js + node_modules mínimos)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Standalone usa server.js, no next start
CMD ["node", "server.js"]
