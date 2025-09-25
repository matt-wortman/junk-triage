# Docker Containerization Plan for Tech-Triage-Platform

## 🎯 Executive Summary

This comprehensive plan outlines the containerization of the tech-triage-platform application using Docker, with separate configurations for development, testing, and production environments. The implementation follows security best practices and includes automated testing workflows.

## 📋 Project Context

Based on `DEMO_DATA_FIX_PLAN.md`, the application stack includes:
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL
- **Key Features**: Demo data seeding, comprehensive test suite, production-ready verification scripts

## 🏗️ Phase 1: Core Docker Files Creation

### 1.1 Production Dockerfile

**File**: `Dockerfile`

```dockerfile
# Multi-stage build for optimized production image
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create system group and user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files and scripts for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

# Install only Prisma CLI for migrations
RUN npm install prisma --save-dev

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
```

### 1.2 Development Dockerfile

**File**: `Dockerfile.dev`

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install system dependencies including PostgreSQL client for debugging
RUN apk add --no-cache postgresql-client curl

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose ports for Next.js dev server and Prisma Studio
EXPOSE 3000 5555

# Development command with database setup
CMD ["sh", "-c", "npx prisma migrate dev && npm run dev"]
```

### 1.3 Docker Ignore File

**File**: `.dockerignore`

```
# Dependencies
node_modules
npm-debug.log*
.npm

# Build outputs
.next/
out/
dist/

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git
.gitignore

# Documentation
*.md
!README.md

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
.nyc_output

# Docker files (to avoid recursive copying)
Dockerfile*
docker-compose*.yml
.dockerignore

# Testing
.coverage/
.jest/
test-results/

# Temporary files
.tmp/
temp/
```

## 🔧 Phase 2: Docker Compose Configurations

### 2.1 Development Environment

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: triage_postgres_dev
    environment:
      POSTGRES_USER: triageuser
      POSTGRES_PASSWORD: triagepass
      POSTGRES_DB: triagedb
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U triageuser -d triagedb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - triage_network

  # Main Application
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: triage_app_dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
      - "5555:5555"  # Prisma Studio
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://triageuser:triagepass@postgres:5432/triagedb
      - SEED_DEMO_DATA=true
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=dev-secret-key-change-in-production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - triage_network
    stdin_open: true
    tty: true

  # Database Administration (Development only)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: triage_pgadmin_dev
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@triage.local
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: "False"
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - postgres
    networks:
      - triage_network

networks:
  triage_network:
    driver: bridge

volumes:
  postgres_dev_data:
    driver: local
  pgadmin_data:
    driver: local
```

### 2.2 Production Environment

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database - Production
  postgres:
    image: postgres:15-alpine
    container_name: triage_postgres_prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432"  # Internal only
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - triage_network
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    security_opt:
      - no-new-privileges:true

  # Main Application - Production
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_BUILD_TIME: ${BUILD_TIME:-unknown}
    container_name: triage_app_prod
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - SEED_DEMO_DATA=${SEED_DEMO_DATA:-false}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - triage_network
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /app/.next/cache:noexec,nosuid,size=100m

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: triage_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - app
    networks:
      - triage_network
    restart: unless-stopped

networks:
  triage_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_prod_data:
    driver: local
```

### 2.3 Testing Environment

**File**: `docker-compose.test.yml`

```yaml
version: '3.8'

services:
  # Test Database (In-Memory)
  postgres-test:
    image: postgres:15-alpine
    container_name: triage_postgres_test
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: testdb
    tmpfs:
      - /var/lib/postgresql/data:rw,noexec,nosuid,size=1g
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U testuser -d testdb"]
      interval: 5s
      timeout: 3s
      retries: 3
    networks:
      - test_network

  # Test Application
  test:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: triage_app_test
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://testuser:testpass@postgres-test:5432/testdb
      - SEED_DEMO_DATA=true
    depends_on:
      postgres-test:
        condition: service_healthy
    networks:
      - test_network
    volumes:
      - .:/app
      - /app/node_modules
    command: |
      sh -c "
        echo '🧪 Setting up test environment...'
        npx prisma migrate deploy
        echo '🌱 Seeding test data...'
        npx prisma db seed
        echo '🔍 Running tests...'
        npm test
        echo '✅ Verifying demo data integrity...'
        tsx scripts/verify-demo-data.ts
        echo '🎉 All tests completed successfully!'
      "

networks:
  test_network:
    driver: bridge

# No volumes needed for testing - everything is ephemeral
```

## 🌍 Phase 3: Environment Configuration

### 3.1 Environment Template

**File**: `.env.docker`

```env
# =============================================================================
# DOCKER ENVIRONMENT CONFIGURATION
# =============================================================================
# Copy this file to .env and customize for your environment

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------
DB_USER=triageuser
DB_PASSWORD=your-secure-password-here
DB_NAME=triagedb
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# -----------------------------------------------------------------------------
# Application Configuration
# -----------------------------------------------------------------------------
NODE_ENV=production
PORT=3000

# Next.js Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-generate-a-long-random-string
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# -----------------------------------------------------------------------------
# Demo Data Configuration
# -----------------------------------------------------------------------------
SEED_DEMO_DATA=false  # Set to true only for development/testing

# -----------------------------------------------------------------------------
# Build Configuration
# -----------------------------------------------------------------------------
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# -----------------------------------------------------------------------------
# Backup Configuration
# -----------------------------------------------------------------------------
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# -----------------------------------------------------------------------------
# Security Configuration
# -----------------------------------------------------------------------------
# Generate secure secrets using: openssl rand -base64 32
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# -----------------------------------------------------------------------------
# Monitoring & Logging
# -----------------------------------------------------------------------------
LOG_LEVEL=info
ENABLE_METRICS=true
```

### 3.2 Development Environment File

**File**: `.env.development`

```env
# Development Environment Configuration
NODE_ENV=development
DATABASE_URL=postgresql://triageuser:triagepass@localhost:5432/triagedb
SEED_DEMO_DATA=true
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
LOG_LEVEL=debug
```

## 🧪 Phase 4: Testing Strategy

### 4.1 Test Execution Script

**File**: `scripts/test-docker.sh`

```bash
#!/bin/bash

# =============================================================================
# Docker Test Execution Script
# =============================================================================

set -e  # Exit on any error

echo "🐳 Docker Test Suite for Tech-Triage-Platform"
echo "================================================"

# Configuration
TEST_COMPOSE_FILE="docker-compose.test.yml"
TEST_TIMEOUT=600  # 10 minutes

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up test environment..."
    docker-compose -f $TEST_COMPOSE_FILE down -v --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start test environment
echo "🚀 Starting test environment..."
docker-compose -f $TEST_COMPOSE_FILE up --build --abort-on-container-exit --timeout $TEST_TIMEOUT

# Capture exit code
TEST_EXIT_CODE=$?

# Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE
```

### 4.2 Integration Test Script

**File**: `scripts/integration-test.sh`

```bash
#!/bin/bash

# =============================================================================
# Integration Test Script
# =============================================================================

echo "🔧 Integration Test Suite"
echo "========================="

# Test database connectivity
echo "📡 Testing database connection..."
docker-compose exec app npx prisma db execute --sql "SELECT 1"

# Test demo data seeding
echo "🌱 Testing demo data seeding..."
docker-compose exec app npx prisma db seed

# Test data verification
echo "🔍 Running data verification..."
docker-compose exec app tsx scripts/verify-demo-data.ts

# Test API health endpoints
echo "🏥 Testing health endpoints..."
docker-compose exec app curl -f http://localhost:3000/api/health

echo "✅ Integration tests completed!"
```

## 🔨 Phase 5: Build & Deployment Scripts

### 5.1 Production Build Script

**File**: `scripts/docker-build.sh`

```bash
#!/bin/bash

# =============================================================================
# Production Docker Build Script
# =============================================================================

set -e

echo "🏗️  Building Production Docker Image"
echo "===================================="

# Configuration
IMAGE_NAME="tech-triage-platform"
IMAGE_TAG="${1:-latest}"
DOCKERFILE="Dockerfile"

echo "📦 Building image: $IMAGE_NAME:$IMAGE_TAG"

# Build the image
docker build \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    -f "$DOCKERFILE" \
    --build-arg BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    .

echo "✅ Build completed successfully!"

# Optional: Run security scan
if command -v docker scan &> /dev/null; then
    echo "🔒 Running security scan..."
    docker scan "$IMAGE_NAME:$IMAGE_TAG" || echo "⚠️  Security scan completed with warnings"
fi

# Show image information
echo "📊 Image Information:"
docker images "$IMAGE_NAME:$IMAGE_TAG"

# Optional: Test the image
echo "🧪 Quick smoke test..."
CONTAINER_ID=$(docker run -d --rm -p 3001:3000 -e DATABASE_URL="postgresql://test:test@host.docker.internal:5432/test" "$IMAGE_NAME:$IMAGE_TAG")
sleep 5

if docker ps | grep -q "$CONTAINER_ID"; then
    echo "✅ Container started successfully"
    docker stop "$CONTAINER_ID" 2>/dev/null || true
else
    echo "❌ Container failed to start"
    exit 1
fi

echo "🎉 Production build completed!"
```

### 5.2 Database Initialization Script

**File**: `scripts/docker-init.sh`

```bash
#!/bin/bash

# =============================================================================
# Docker Database Initialization Script
# =============================================================================

set -e

echo "🗃️  Initializing Database"
echo "========================"

# Wait for database to be ready
echo "⏳ Waiting for database..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U ${DB_USER:-triageuser}; do sleep 2; done'

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
docker-compose exec app npx prisma generate

# Seed database if requested
if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
    echo "🌱 Seeding demo data..."
    docker-compose exec app npx prisma db seed

    echo "✅ Verifying seeded data..."
    docker-compose exec app tsx scripts/verify-demo-data.ts
fi

echo "🎉 Database initialization completed!"
```

### 5.3 Deployment Script

**File**: `scripts/deploy.sh`

```bash
#!/bin/bash

# =============================================================================
# Production Deployment Script
# =============================================================================

set -e

echo "🚀 Deploying Tech-Triage-Platform"
echo "================================="

# Configuration
ENVIRONMENT="${1:-production}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Validation
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "💡 Copy .env.docker to $ENV_FILE and configure it"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
source "$ENV_FILE"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not configured!"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET not configured!"
    exit 1
fi

# Build and deploy
echo "🏗️  Building and deploying..."
docker-compose -f "$COMPOSE_FILE" up --build -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
timeout 120 bash -c 'until docker-compose -f '"$COMPOSE_FILE"' exec app curl -f http://localhost:3000/api/health; do sleep 5; done'

echo "✅ Deployment completed successfully!"

# Show running containers
docker-compose -f "$COMPOSE_FILE" ps
```

## 🏥 Phase 6: Health Checks & Monitoring

### 6.1 Health Check API Endpoint

**File**: `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: process.env.npm_package_version || 'unknown',
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}

// Health check that doesn't require authentication
export const runtime = 'nodejs';
```

### 6.2 Monitoring Configuration

**File**: `monitoring/docker-compose.monitoring.yml`

```yaml
version: '3.8'

services:
  # Application monitoring (optional)
  prometheus:
    image: prom/prometheus:latest
    container_name: triage_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: triage_grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
```

## 🔄 Phase 7: CI/CD Integration

### 7.1 GitHub Actions Workflow

**File**: `.github/workflows/docker-ci.yml`

```yaml
name: Docker CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: tech-triage-platform

jobs:
  # Static Analysis
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

  # Unit Tests
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

  # Integration Tests with Docker
  integration-tests:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, unit-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Create test environment file
        run: |
          cat > .env << EOF
          NODE_ENV=test
          DATABASE_URL=postgresql://testuser:testpass@postgres-test:5432/testdb
          SEED_DEMO_DATA=true
          NEXTAUTH_SECRET=test-secret-key
          EOF

      - name: Run integration tests
        run: |
          chmod +x scripts/test-docker.sh
          ./scripts/test-docker.sh

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/

  # Security Scanning
  security-scan:
    runs-on: ubuntu-latest
    needs: [integration-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t $IMAGE_NAME:scan .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ env.IMAGE_NAME }}:scan'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  # Build and Push Docker Images
  build-and-push:
    runs-on: ubuntu-latest
    needs: [integration-tests, security-scan]
    if: github.event_name != 'pull_request'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            BUILD_TIME=${{ github.event.head_commit.timestamp }}

  # Deploy to Staging (optional)
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build-and-push]
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to staging
        run: |
          echo "🚀 Deploying to staging environment..."
          # Add your deployment commands here
```

## 📚 Phase 8: Documentation

### 8.1 Docker Quick Start Guide

**File**: `docs/docker-guide.md`

```markdown
# Docker Quick Start Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Development Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd tech-triage-platform
   cp .env.docker .env
   # Edit .env with your configuration
   ```

2. **Start development environment**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - App: http://localhost:3000
   - Prisma Studio: http://localhost:5555
   - PgAdmin: http://localhost:5050 (admin@triage.local / admin123)

## Production Deployment

1. **Prepare environment**:
   ```bash
   cp .env.docker .env
   # Configure production values in .env
   ```

2. **Deploy**:
   ```bash
   ./scripts/deploy.sh production
   ```

## Common Commands

```bash
# Run tests
./scripts/test-docker.sh

# Build production image
./scripts/docker-build.sh

# Initialize database
./scripts/docker-init.sh

# View logs
docker-compose logs -f app

# Database shell
docker-compose exec postgres psql -U triageuser -d triagedb
```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs app`
- Verify environment variables in `.env`
- Ensure database is healthy: `docker-compose ps`

### Database connection issues
- Verify PostgreSQL container is running
- Check DATABASE_URL format
- Test connection: `docker-compose exec app npx prisma db execute --sql "SELECT 1"`

### Build failures
- Clear Docker cache: `docker system prune -a`
- Check Dockerfile syntax
- Verify all required files are present

## Performance Optimization

- Use multi-stage builds (already implemented)
- Optimize .dockerignore to reduce context size
- Use Alpine images where possible
- Implement proper caching strategies
```

## 🏁 Implementation Phases & Timeline

### Phase 1: Foundation (Days 1-2)
- [ ] Create all Dockerfiles and compose files
- [ ] Set up environment configurations
- [ ] Test basic containerization

### Phase 2: Testing Infrastructure (Days 3-4)
- [ ] Implement test automation
- [ ] Create health check endpoints
- [ ] Set up monitoring infrastructure

### Phase 3: CI/CD Integration (Days 5-6)
- [ ] Configure GitHub Actions
- [ ] Implement security scanning
- [ ] Test deployment pipelines

### Phase 4: Production Readiness (Days 7-8)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion

### Phase 5: Validation (Day 9)
- [ ] End-to-end testing
- [ ] Production deployment test
- [ ] Performance benchmarking

## ✅ Success Criteria

### Technical Requirements
- [ ] **Development environment** starts with single command
- [ ] **Database migrations** run automatically
- [ ] **Demo data seeding** works correctly in containers
- [ ] **All tests pass** in containerized environment
- [ ] **Production image** size < 500MB
- [ ] **Health checks** function properly
- [ ] **CI/CD pipeline** executes successfully

### Security Requirements
- [ ] **Non-root user** in production containers
- [ ] **Secrets management** properly implemented
- [ ] **Network isolation** configured
- [ ] **Security scanning** integrated
- [ ] **Read-only filesystems** where applicable

### Performance Requirements
- [ ] **Container startup** < 30 seconds
- [ ] **Health check response** < 5 seconds
- [ ] **Build time** < 10 minutes
- [ ] **Image layers** properly cached

### Documentation Requirements
- [ ] **Quick start guide** complete
- [ ] **Troubleshooting section** comprehensive
- [ ] **Deployment procedures** documented
- [ ] **Environment configuration** explained

## 🔒 Security Considerations

### Container Security
- Non-root users in all containers
- Read-only filesystems where possible
- Resource limits to prevent DoS
- Regular security updates

### Network Security
- Internal networks for service communication
- Minimal port exposure
- TLS encryption for external connections
- Firewall rules for production

### Data Security
- Encrypted database connections
- Secrets management via Docker secrets
- Regular automated backups
- Data encryption at rest

### Monitoring & Auditing
- Comprehensive logging strategy
- Security event monitoring
- Regular vulnerability scans
- Compliance reporting

---

## 📞 Support & Maintenance

This Docker implementation follows industry best practices and includes comprehensive testing and monitoring capabilities. The modular design allows for easy customization and scaling based on specific deployment requirements.

For questions or issues:
1. Check the troubleshooting section
2. Review container logs
3. Consult the project documentation
4. Create an issue in the project repository

**Remember**: This is a production-ready containerization plan designed to support the tech-triage-platform's mission of handling confidential medical technology assessments with the highest standards of security and reliability.