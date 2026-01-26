# Build stage
FROM oven/bun:1.2 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/web apps/web
COPY packages packages
COPY tooling tooling
COPY tsconfig.json ./

# Build arguments for env vars
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Build (skip tsc for Docker builds, type checking done in CI)
WORKDIR /app/apps/web
RUN bunx vite build

# Production stage - nginx to serve static files
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
