# ==========================================
# HR Analytics Dashboard — AZ Tech
# Multi-stage Dockerfile
# ==========================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

ENV NODE_ENV=production

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY api/ ./api/
COPY public/ ./public/
COPY package.json ./

# Port (Cloud Run will override via $PORT env)
EXPOSE 3000

# Run as non-root
USER appuser

# Start server
CMD ["node", "api/index.js"]
