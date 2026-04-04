# Deployment Guide (Vercel + Railway)

> How to connect your Vercel frontend to your Railway backend for a professional, production-ready setup.

## The "Handshake" Concept

Since your frontend and backend live on different domains (e.g. `meshwork.vercel.app` and `meshwork-api.up.railway.app`), they need to trust each other. This is handled via **Environment Variables**.

---

## 1. Railway Setup (Backend)

Your backend needs to know where the frontend is to allow **CORS** (Cross-Origin Resource Sharing) and secure cookie transmission.

### Required Variables in Railway
Go to your Railway project → **Variables** and add these:

| Variable | Example Value | Why? |
|----------|---------------|------|
| `FRONTEND_URL` | `https://your-app.vercel.app` | **CRITICAL**: Tells the backend to allow requests from your Vercel site. |
| `SESSION_SECRET` | `openssl rand -base64 32` | Encrypts user sessions. |
| `ENCRYPTION_KEY` | `node -e "..."` (32 bytes) | Encrypts AI API keys (BYOK). |
| `DATABASE_URL` | (Auto-provided) | Connection to your Postgres instance. |
| `NODE_ENV` | `production` | Enables security headers (Helmet). |

> [!IMPORTANT]
> Do **not** include a trailing slash in `FRONTEND_URL`. Use `https://my-app.vercel.app`, not `https://my-app.vercel.app/`.

---

## 2. Vercel Setup (Frontend)

Your React app needs to know where the API server is located.

### Required Variables in Vercel
Go to your Vercel project → **Settings** → **Environment Variables**:

| Variable | Example Value | Why? |
|----------|---------------|------|
| `VITE_API_URL` | `https://your-api.up.railway.app` | Directs all `apiRequest()` calls to your Railway server. |

### Vercel Configuration Tips
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 3. The CORS Middleware (How it works)

In `server/index.ts`, we've implemented a dynamic CORS policy that automatically matches your `FRONTEND_URL`:

```typescript
const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
  origin: frontendUrl,
  credentials: true, // Allows sessions/cookies to work across domains
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));
```

---

## 4. Troubleshooting Checklist

### ❌ "401 Unauthorized" on every request
- **CORS Failure**: Ensure your `FRONTEND_URL` in Railway matches the Vercel URL exactly (including `https://`).
- **Credentials**: Ensure `credentials: "include"` is set in your fetch calls (our `secureFetch` does this automatically).

### ❌ "Mixed Content" Errors
- Ensure both URLs start with `https://`. Railway and Vercel provide SSL by default.

### ❌ "Invalid CSRF Token"
- This usually happens if the session cookie isn't being saved because of a domain mismatch. Fix the `FRONTEND_URL` and `credentials` settings.

---

## Summary Command

To generate your secrets for Railway:

```bash
# For SESSION_SECRET
openssl rand -base64 32

# For ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
