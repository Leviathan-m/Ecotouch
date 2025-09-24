# 🚀 Ecotouch 프로덕션 배포 가이드

이 가이드는 Ecotouch를 프로덕션 환경에 배포하기 위한 완전한 설정 방법을 설명합니다.

## 📋 프로덕션 배포 체크리스트

### ✅ 사전 준비사항

- [ ] 프로덕션 서버 준비 (AWS EC2, DigitalOcean, etc.)
- [ ] 도메인 등록 및 DNS 설정
- [ ] SSL 인증서 준비 (Let's Encrypt 또는 유료 인증서)
- [ ] PostgreSQL 데이터베이스 설정
- [ ] Redis 캐시 서버 설정
- [ ] SMTP 이메일 서비스 설정

### ✅ 환경 설정

프로젝트 루트에 `.env.production` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```bash
# =============================================================================
# PRODUCTION ENVIRONMENT
# =============================================================================
NODE_ENV=production
PORT=3001

# =============================================================================
# PRODUCTION DATABASE
# =============================================================================
DATABASE_URL=postgresql://username:password@production-db-host:5432/ecotouch_prod
REDIS_HOST=production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-production-redis-password

# =============================================================================
# PRODUCTION BLOCKCHAIN (Polygon Mainnet)
# =============================================================================
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
ACCOUNT_FACTORY_ADDRESS=0x...
IMPACT_BADGE_SBT_ADDRESS=0x...
SBT_SIGNER_PRIVATE_KEY=your-production-private-key
BUNDLER_URL=https://api.pimlico.io/v1/polygon/bundler/your-production-api-key

# =============================================================================
# PRODUCTION EXTERNAL APIs
# =============================================================================
CLOVERLY_API_KEY=your-production-cloverly-key
ONE_CLICK_IMPACT_API_KEY=your-production-1clickimpact-key
NATION_BUILDER_API_KEY=your-production-nationbuilder-key

# =============================================================================
# PRODUCTION TELEGRAM
# =============================================================================
TELEGRAM_BOT_TOKEN=your-production-telegram-bot-token
TELEGRAM_WEBAPP_URL=https://your-production-domain.com

# =============================================================================
# PRODUCTION SECURITY
# =============================================================================
JWT_SECRET=your-production-jwt-secret-here
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret-here
CORS_ORIGIN=https://your-production-domain.com

# =============================================================================
# PRODUCTION MONITORING
# =============================================================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=warn
```

## 🐳 프로덕션 Docker 설정

### Dockerfile 최적화

```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install dependencies only (for better caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript (if needed)
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ecotouch -u 1001

USER ecotouch

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  ecotouch-backend:
    build:
      context: .
      dockerfile: backend/Dockerfile.prod
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  ecotouch-frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile.prod
    environment:
      - NODE_ENV=production
    ports:
      - "80:80"
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecotouch_prod
      POSTGRES_USER: ecotouch_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/config/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - ecotouch-frontend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 🔒 보안 강화

### SSL/TLS 설정

```nginx
# nginx/nginx.prod.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    upstream backend {
        server ecotouch-backend:3001;
    }

    upstream frontend {
        server ecotouch-frontend:80;
    }

    server {
        listen 443 ssl http2;
        server_name your-production-domain.com;

        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;

        # API routes
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-production-domain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### 프로덕션 보안 미들웨어

```typescript
// backend/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  // Security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
];
```

## 📊 모니터링 및 로깅

### Sentry 설정

```typescript
// backend/src/utils/sentry.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
```

### 프로덕션 로깅

```typescript
// backend/src/utils/logger.ts (production config)
import winston from 'winston';

const prodLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  prodLogger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export { prodLogger as logger };
```

## 🚀 배포 스크립트

### 배포 자동화 스크립트

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting Ecotouch production deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run tests
npm test

# Build application
npm run build

# Run database migrations
cd backend && npm run db:migrate

# Build and deploy Docker containers
docker compose -f docker-compose.prod.yml up -d --build

# Run health check
sleep 30
curl -f https://your-production-domain.com/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 롤백 스크립트

```bash
#!/bin/bash
# scripts/rollback.sh

echo "🔄 Rolling back to previous version..."

# Stop current containers
docker compose -f docker-compose.prod.yml down

# Restore previous image/tag
docker tag ecotouch-backend:previous ecotouch-backend:latest
docker tag ecotouch-frontend:previous ecotouch-frontend:latest

# Start with previous version
docker compose -f docker-compose.prod.yml up -d

echo "✅ Rollback completed!"
```

## 🔍 헬스 체크 및 모니터링

### 헬스 체크 엔드포인트

```typescript
// backend/src/controllers/health.ts
import { Router } from 'express';
import { createConnection } from 'typeorm';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await createConnection();

    // Check Redis connection
    // Add your Redis health check

    // Check external APIs
    // Add your API health checks

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
```

## 📈 성능 최적화

### 프로덕션 빌드 설정

```javascript
// frontend/config-overrides.js (for production)
const { override, addBundleVisualizer, addWebpackPlugin } = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = override(
  // Bundle analyzer
  process.env.ANALYZE && addBundleVisualizer(),

  // Compression
  addWebpackPlugin(
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    })
  ),

  // Code splitting
  (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    return config;
  }
);
```

## 🔄 백업 및 복구

### 데이터베이스 백업 스크립트

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/ecotouch"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ecotouch_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
docker exec ecotouch_postgres pg_dump -U ecotouch_user ecotouch_prod > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_FILE.gz"
```

이제 프로덕션 배포 준비가 완료되었습니다! 각 단계를 따라가며 실제 배포를 진행하세요.
