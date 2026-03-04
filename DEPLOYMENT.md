# Meshwork Studio - Production Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────────────┐
│     Vercel      │────▶│          Railway            │
│  (Landing Page) │     │   (API + PostgreSQL DB)     │
│  (Main App SPA) │     │                             │
└─────────────────┘     └─────────────────────────────┘
```

## Platform Breakdown

### 1. Railway (Backend + Database)
**What it hosts:**
- Express API server (`server/`)
- PostgreSQL database (managed by Railway)
- Session management

**Why Railway:**
- One platform for everything
- Auto-creates PostgreSQL
- Docker support with zero config
- Automatic deployments from Git
- Easy environment variables

### 2. Vercel (Frontend)
**What it hosts:**
- Landing page (`landing_page/` directory)
- Main React app (static SPA from `dist/public/`)

**Why Vercel:**
- Edge deployment (fastest global CDN)
- Automatic HTTPS
- Preview deployments on PR
- Zero-config for Vite/React

## Deployment Steps

### Step 1: Railway Setup (Backend + DB)

1. **Create Railway Account**
   - Go to https://railway.app
   - Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Meshwork-Studio repository

3. **Add PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway auto-creates `DATABASE_URL` variable

4. **Add Environment Variables**
   Go to your Railway project → Variables → New Variable:
   
   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-vercel-domain.vercel.app` (we'll update this after Vercel) |
   | `SESSION_SECRET` | Generate: `openssl rand -base64 32` |
   | `PORT` | `5000` |

   Note: `DATABASE_URL` is auto-created by Railway when you add PostgreSQL.

5. **Deploy**
   - Railway auto-deploys on first setup
   - Copy the Railway URL (e.g., `https://meshwork-api.up.railway.app`)

### Step 2: Vercel Setup (Frontend)

**Landing Page:**
1. Go to https://vercel.com
2. Click "Add New Project" → Import GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `landing_page`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment Variables:
   - `VITE_API_URL` = `https://your-railway-url.up.railway.app`
5. Click Deploy

**Main App:**
1. Create another Vercel project from same repo
2. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `dist/public`
   - Note: Build happens in CI/CD, not on Vercel
3. Environment Variables:
   - `VITE_API_URL` = `https://your-railway-url.up.railway.app`
4. Click Deploy

### Step 3: Update Railway with Vercel URL

1. Go back to Railway Dashboard
2. Find your project → Variables
3. Update `FRONTEND_URL` to your Vercel domain:
   - `https://your-app.vercel.app`
4. Railway auto-redeploys

### Step 4: Run Database Migrations

**Option A: Railway CLI (Recommended)**
```bash
railway login
railway link  # select your project
railway run npm run db:push
```

**Option B: Connect to Railway Postgres locally**
```bash
# Get DATABASE_URL from Railway Dashboard
export DATABASE_URL="postgresql://postgres:password@host:5432/railway"
npm run db:push
```

## Environment Variables Reference

### Railway (Backend + DB)
```
DATABASE_URL=        # Auto-created by Railway PostgreSQL
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
SESSION_SECRET=your-random-secret-key
PORT=5000
```

### Vercel (Landing Page + Main App)
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

## Custom Domains

### Vercel
Settings → Domains → Add Domain

### Railway
Settings → Domains → Generate Domain (or add custom)

## Monitoring

- **Vercel**: Built-in analytics + Speed Insights
- **Railway**: Metrics dashboard + logs for both API and database

## Troubleshooting

### CORS Issues
Ensure `FRONTEND_URL` in Railway matches your Vercel domain exactly (including `https://`).

### Database Connection Fails
Check that `DATABASE_URL` is set correctly. Railway auto-sets this when you add PostgreSQL.

### Migrations Fail
Make sure Railway PostgreSQL is fully provisioned (green checkmark) before running migrations.

## Cost Estimate (Monthly)

| Platform | Free Tier | Paid (Start) |
|----------|-----------|--------------|
| Vercel   | 100GB/mo  | $20/mo       |
| Railway  | $5 credit | $5-20/mo     |
| **Total**| **$0**    | **~$25/mo**  |

## Quick Commands

```bash
# Deploy manually
vercel --prod ./landing_page
railway up

# Run migrations
railway run npm run db:push

# Check logs
railway logs
```
