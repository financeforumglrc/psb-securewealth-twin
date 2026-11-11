# DS Financial — Comprehensive Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudflare DNS                             │
│              dsfinancial.in → GitHub Pages / Surge              │
│              api.dsfinancial.in → Render / Docker               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Nginx     │  (SSL termination, caching, rate limiting)
                    │  Reverse    │
                    │   Proxy     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
         │ Frontend │ │ Backend │ │  Redis  │
         │  Vite   │ │ Express │ │  Cache  │
         │  Build  │ │  API    │ │         │
         └─────────┘ └─────────┘ └─────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         ┌────┴────┐        ┌────┴────┐
         │ SQLite  │        │PostgreSQL│
         │(Primary)│        │(Sync)    │
         └─────────┘        └─────────┘
```

## Deployment Options

### Option 1: GitHub Pages + Render (Recommended)

**Frontend — GitHub Pages**

The CI/CD pipeline automatically deploys the frontend to GitHub Pages on every push to `main`.

```bash
# Manual deploy
npm run build
npx gh-pages -d dist
```

**Backend — Render**

1. Create a Web Service on Render
2. Connect your GitHub repo
3. Use `render.yaml` blueprint (auto-detected)
4. Set environment variables in Render Dashboard
5. Deploy

### Option 2: Surge.sh + Render

```bash
# Frontend
npm run build
surge --project dist --domain dsfinancial-47556.surge.sh

# Backend — same as Option 1
```

### Option 3: Full Docker Deployment

```bash
# Build and start all services
docker-compose -f backend/docker-compose.yml --profile full up -d

# This starts: API, Nginx, Redis, PostgreSQL
```

### Option 4: Kubernetes (Advanced)

```bash
# Build Docker image
docker build -t ghcr.io/your-org/ds-financial-api:latest backend/

# Push to registry
docker push ghcr.io/your-org/ds-financial-api:latest

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## Environment Setup

### Production Environment Variables

```bash
# Required
JWT_SECRET=<strong-random-64-char-string>

# AI Providers (at least one required)
GOOGLE_API_KEY=<gemini-api-key>
OPENAI_API_KEY=<openai-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>

# Admin
ADMIN_ID=<your-admin-username>
ADMIN_PASSWORD=<strong-admin-password>

# Optional but recommended
SENDGRID_API_KEY=<sendgrid-key>
RAZORPAY_KEY_ID=<razorpay-key>
RAZORPAY_KEY_SECRET=<razorpay-secret>
REDIS_URL=<redis-connection-string>
DATABASE_URL=<postgres-connection-string>
```

### SSL Certificates (Production)

```bash
# Using Let's Encrypt with Certbot
certbot --nginx -d api.dsfinancial.in

# Or use Cloudflare Origin Certificates
# Place in backend/ssl/
```

## Health Checks

Configure your deployment platform with these health checks:

- **Endpoint:** `GET /api/v1/health`
- **Expected Status:** 200
- **Interval:** 30s
- **Timeout:** 5s
- **Retries:** 3

## Scaling Considerations

### Database
- SQLite handles thousands of concurrent reads
- Enable PostgreSQL (`DATABASE_URL`) for multi-instance deployments
- Redis caching reduces DB load by 60%+

### Performance
- Nginx caches static assets for 30 days
- API responses are compressed (gzip level 6)
- Rate limiting prevents abuse (100 req/15min general, 10 req/min AI)
- Database queries use prepared statements and indexes

### Monitoring
- **Metrics:** `GET /api/v1/metrics`
- **Admin Dashboard:** `GET /api/v1/admin/status` (Basic Auth)
- **Logs:** Structured JSON in `logs/` directory
- **Alerts:** Configure uptime monitoring on Render/GitHub Pages

## Rollback Procedure

```bash
# GitHub Pages — revert commit
git revert HEAD
git push origin main

# Render — use Rollback button in Render Dashboard
# Docker — redeploy previous image tag
docker pull ghcr.io/your-org/ds-financial-api:previous-tag
```
