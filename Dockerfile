# syntax=docker/dockerfile:1

# Tech Triage Platform - Node.js Application
# Following Docker best practices from official documentation

ARG NODE_VERSION=18.20.4

# =====================================
# Base stage for shared configuration
# =====================================
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

# =====================================
# Dependencies stage - install packages
# =====================================
FROM base AS deps
# Download dependencies as a separate step to take advantage of Docker's caching
# Leverage a cache mount to /root/.npm to speed up subsequent builds
# Leverage bind mounts to package files to avoid copying them into this layer
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# =====================================
# Build stage - compile application
# =====================================
FROM deps AS build
# Copy source code and build the application
COPY . .
# Generate Prisma client
RUN npx prisma generate
# Build Next.js application (will fail if linting/type errors exist)
ENV DOCKER_BUILD=true
RUN npm run build

# =====================================
# Production dependencies
# =====================================
FROM base AS prod-deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# =====================================
# Final production stage
# =====================================
FROM base AS final

# Use production node environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run the application as a non-root user
USER node

# Copy built application from build stage
COPY --from=build --chown=node:node /usr/src/app/.next/standalone ./
COPY --from=build --chown=node:node /usr/src/app/.next/static ./.next/static
COPY --from=build --chown=node:node /usr/src/app/public ./public

# Copy Prisma files for database operations
COPY --from=build --chown=node:node /usr/src/app/prisma ./prisma
COPY --from=build --chown=node:node /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Copy production dependencies
COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules

# Run the application
CMD ["node", "server.js"]