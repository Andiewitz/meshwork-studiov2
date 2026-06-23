# Infrastructure & Deployment Guide

This document covers the complete infrastructure setup for Meshwork Studio, including Vercel/Railway deployments, the NGINX architecture, database backup procedures, and our Blue-Green deployment strategy.

---

## 1. NGINX Architecture (Docker)

When running the full stack locally or via Docker Compose, NGINX acts as the **"Front Door"** to the application. 

### Core Responsibilities
- **High-Speed Static File Serving:** NGINX handles the delivery of our compiled React frontend (`dist/public`). Optimized for static delivery, it can serve thousands of concurrent requests rapidly.
- **Reverse Proxy:** NGINX routes traffic intelligently:
  - `/api/` or `/auth/` requests are securely forwarded to the Node.js backend container.
  - All other traffic serves static assets.
- **SPA Routing:** Our `nginx.conf` solves React Router fallback automatically using the `try_files $uri $uri/ /index.html;` directive.
- **Performance:** NGINX applies GZIP compression to plain-text responses and aggressive caching headers (`expires 1y;`) for static assets.

---

## 2. Cloud Deployment (Vercel + Railway)

When deployed to the cloud, the frontend is hosted on Vercel and the backend/database on Railway. Because they live on different domains, they communicate via CORS and secure cookies.

### Railway Setup (Backend)
Required Environment Variables:
| Variable | Example Value | Why? |
|----------|---------------|------|
| `FRONTEND_URL` | `https://your-app.vercel.app` | **CRITICAL**: Tells the backend to allow requests from your Vercel site. No trailing slash. |
| `SESSION_SECRET` | `openssl rand -base64 32` | Encrypts user sessions. |
| `ENCRYPTION_KEY` | `node -e "..."` (32 bytes) | Encrypts AI API keys (BYOK). |
| `DATABASE_URL` | (Auto-provided) | Connection to your Postgres instance. |
| `NODE_ENV` | `production` | Enables security headers (Helmet). |

### Vercel Setup (Frontend)
Required Environment Variables:
| Variable | Example Value | Why? |
|----------|---------------|------|
| `VITE_API_URL` | `https://your-api.up.railway.app` | Directs all `apiRequest()` calls to your Railway server. |

*Vercel Config: Root Dir = `client`, Preset = `Vite`, Build = `npm run build`, Output = `dist`.*

---

## 3. Blue-Green Deployment Strategy

To ensure zero downtime and prevent users from experiencing "half-broken" states during database schema migrations, we follow a Blue-Green deployment on Railway.

1. **Duplicate the Service**: You maintain two services: `Meshwork-Studio [BLUE]` (Live) and `Meshwork-Studio [GREEN]` (Inactive/Next).
2. **Deploy to Green**: Push new code to Green. It runs migrations and boots up on a private preview URL.
3. **Smoke Test**: Verify the Green URL manually. Fix any UI/Sync bugs before the public sees them.
4. **The Traffic Swap**: In the Railway Dashboard, add the production domain to the Green service and remove it from the Blue service.
5. **Post-Launch**: Monitor Green. If it fails, immediately swap the domain back to Blue as an instant "Undo". 

---

## 4. Backups and Data Safety

This project implements two layers of data safety:

### Application-Level Backup (JSON)
Run this before manual schema changes to capture table data as human-readable JSON.
```bash
DATABASE_URL=postgres://... npm run db:backup
```
- Creates a timestamped folder in `./backups/` containing `users.json`, `workspaces.json`, `nodes.json`, etc.
- Safe to run anywhere. `./backups/` is gitignored.

### Infrastructure Backup (PostgreSQL Binary)
If using Docker, run the provided scripts to create full binary `.dump` files.
- Windows: `.\scripts\backup-db.ps1`
- Mac/Linux: `./scripts/backup-db.sh`

### Safe Schema Migrations (Idempotent)
To prevent production data loss, all internal initialization scripts use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. This ensures new columns are safely injected into existing tables without dropping existing data.
