# Single stage - no bundling, just run with bun directly
FROM oven/bun:1.2

WORKDIR /app

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

# Set environment
ENV NODE_ENV=production
ENV API_PORT=3000

EXPOSE 3000

WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]
