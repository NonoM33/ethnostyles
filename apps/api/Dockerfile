# Build stage
FROM oven/bun:1.2 AS builder

WORKDIR /app

# Cache bust to force rebuild - v4
ARG CACHE_BUST=4

# Copy package files
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/config/package.json packages/config/
COPY packages/email/package.json packages/email/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/api apps/api
COPY packages packages
COPY tsconfig.json ./

# Build
WORKDIR /app/apps/api
RUN bun build src/index.ts --outdir dist --target bun

# Production stage
FROM oven/bun:1.2-slim

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Set environment
ENV NODE_ENV=production
ENV API_PORT=3000

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
