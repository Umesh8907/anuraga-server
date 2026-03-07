# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Install production dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests only (better layer caching)
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production runner
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Build-time argument — override via: docker build --build-arg NODE_ENV=production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src ./src
COPY package.json ./

# Set file ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

# Healthcheck — container orchestrators (K8s / ECS) will use this
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "src/server.js"]
