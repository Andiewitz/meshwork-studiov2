# Blue-Green Deployment Guide (Railway Unified)

To ensure users never experience "half-broken" states or downtime during major updates (like database schema changes), we follow a **Blue-Green Deployment** strategy.

Since our frontend and backend are deployed together as a single service on Railway, this process is straightforward but requires careful coordination with the shared database.

---

## 1. The Strategy
Instead of updating the live service directly (Rolling Update), we create a second, identical service for the new version.

- **Blue (Legacy)**: The currently live version (e.g., v1.0).
- **Green (Next)**: The new version you are about to launch (e.g., v1.1).

---

## 2. Infrastructure Setup (One-Time)
1.  **Duplicate the Service**: In your Railway Project, go to the Service → **Settings** → **Duplicate Service**.
2.  **Rename**: Name them `Meshwork-Studio [BLUE]` and `Meshwork-Studio [GREEN]`.
3.  **Variable Sync**: Ensure both services point to the same **Postgres** and **Redis** instances.

---

## 3. The 5-Step Deployment Flow

### Step 1: Pre-Flight Check & Backup
Before any major change, run our backup script to ensure we can restore the database if the migration goes wrong:
```powershell
.\scripts\backup-db.ps1
```

### Step 2: Deploy to "Green" (Inactive)
Push your latest code to the Green service. Railway will build and deploy it under a private **Preview URL** (e.g., `green-production.up.railway.app`).
- **Phase 2.1 (Migrations)**: When the Green service starts, it will run database migrations. Because Postgres handles the changes we made (like the PK update), the Green service will now be "ready."

> [!WARNING]
> **Backward Compatibility**: If you're introducing a change that *breaks* the Blue code (uncommon but possible), users on the Blue site might see errors for a few seconds before you finish Step 4.

### Step 3: Smoke Test Green
Open the private Green URL in your browser. 
- Log in, create a workspace, and try the new features.
- If it fails, fix the code and re-deploy Green. Your users are still safely on **Blue** and haven't noticed a thing.

### Step 4: The Traffic Swap (Flip the Switch)
Once Green is verified:
1.  Go to **Railway Dashboard** → **Green Service** → **Settings**.
2.  In the **Domains** section, add your production domain (e.g., `studio.meshwork.com`).
3.  Go to the **Blue Service** → **Settings** → **Domains** and remove the production domain (or reassign it to a "legacy" alias).

### Step 5: Post-Launch & Cleanup
- Monitor the Green service for high error rates.
- If anything goes wrong, **simply swap the domains back** to Blue. This is your "Undo" button.
- Once confident, you can scale the Blue service to zero to save Railway credits.

---

## Summary Checklist
| Level | Action | Tool |
| :--- | :--- | :--- |
| **Safety** | Run DB Backup | `.\scripts\backup-db.ps1` |
| **Release** | Target the Inactive Service | Railway CLI / Dashboard |
| **Verify** | Test on Preview URL | Visual Audit |
| **Live** | Swap Production Domain | Railway Settings |

---

### Why this works for "Goofy Layouts" and "Sync Errors":
By testing the **Green** environment first, you catch "goofy" UI layouts or sync logic bugs *before* the public sees them. If the layout looks wrong (like the checklist stacking issue), you fix it on Green, and only when it looks premium do you flip the switch.
