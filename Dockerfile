FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# We don't have a build step for the backend, but this stage stands for potential typescript compilation

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=dev

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.env* ./

EXPOSE 4000

ENV PORT=4000

CMD ["npm", "run", "start:dev"]
