# Smart Workplace OS — Deployment Guide

## Architecture

```
Frontend (Vercel) ──HTTPS──→ Backend (Render) ──→ MongoDB (Atlas or Render)
```

---

## 1. MongoDB Setup

### Option A: MongoDB Atlas (recommended)
1. Go to https://www.mongodb.com/atlas → Create free cluster
2. Create a database user (username + password)
3. Under **Network Access** → Add IP: `0.0.0.0/0` (allow all — Render IPs change)
4. Click **Connect** → Drivers → Copy connection string: `mongodb+srv://chairmaduraipaids2023_db_user:<db_password>@worksphere.zfxfxch.mongodb.net/?appName=WorkSphere`

### Option B: Render MongoDB
1. In Render dashboard → **New** → **MongoDB**
2. Create database → Copy the internal connection string

---

## 2. Backend — Deploy on Render

### Step 1: Create Web Service
1. Go to https://dashboard.render.com → **New +** → **Web Service**
2. Connect your GitHub repo (`Durai0804/Worksphere---Ai-workspace`)
3. Fill in:

| Field | Value |
|-------|-------|
| **Name** | `smart-workplace-os-api` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (or Starter) |

### Step 2: Add Environment Variables

In Render dashboard → your service → **Environment** → **Add Environment Variable**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/smart-workplace-os?retryWrites=true&w=majority` |
| `JWT_SECRET` | Generate a 64-char random string: `openssl rand -hex 32` or use an online generator |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` (replace with your actual Vercel URL) |
| `AI_API_KEY` | *(optional — leave empty for now)* |

> **Do NOT set `PORT`** — Render assigns a dynamic port automatically (e.g., `10000`). The server reads `process.env.PORT` and binds to `0.0.0.0`.

### Step 3: Deploy
- Click **Deploy** → wait 2-3 minutes
- Copy your Render URL: `https://smart-workplace-os-api.onrender.com`

### Step 4: Verify
Open `https://smart-workplace-os-api.onrender.com/api/health` in browser.

Expected response:
```json
{ "success": true, "message": "Smart Workplace OS API is running", "environment": "production", "uptime": 42 }
```

---

## 3. Frontend — Deploy on Vercel

### Step 1: Connect Repository
1. Go to https://vercel.com/new
2. Import your GitHub repo (`Durai0804/Worksphere---Ai-workspace`)
3. **Root Directory**: select `client`
4. **Framework Preset**: `Vite`

### Step 2: Add Environment Variables

In Vercel project **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://smart-workplace-os-api.onrender.com/api` |
| `VITE_FACE_MODEL_URL` | `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model` |

### Step 3: Deploy
- Click **Deploy**
- Vercel will auto-build and deploy
- Copy your Vercel URL: `https://your-app.vercel.app`

---

## 4. Final Configuration

### Update CORS on Render
Go back to Render → Environment → Edit `CORS_ORIGIN` to include your Vercel domain:

```
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:5173
```

Then **Manual Deploy → Deploy** on Render.

### Demo Users (auto-seeded)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workplace.com | admin123 |
| HR | hr@workplace.com | hr123456 |
| Employee | john@workplace.com | emp12345 |

---

## 5. Troubleshooting

### CORS errors in browser console
- Verify `CORS_ORIGIN` on Render matches your Vercel domain exactly
- Check Vercel URL has no trailing slash

### "MongooseServerSelectionError"
- Check MongoDB Atlas **Network Access** includes `0.0.0.0/0`
- Verify `MONGODB_URI` is correct

### Blank page on Vercel
- Go to Vercel → Deployments → latest → **Inspect**
- Check Build Logs for errors
- Verify `VITE_API_URL` is set correctly

### Avatar images not loading
- The app auto-resolves relative image paths to absolute Render URLs
- Ensure `VITE_API_URL` on Vercel matches your Render API URL

### "No open HTTP ports detected" on Render
This means the server started but crashed shortly after. Common causes:

1. **Missing `NODE_ENV=production`** — Set this in Render env vars. Without it, the server may use development-only features that fail in Render's read-only filesystem.

2. **File transport errors** — The logger gracefully falls back to console-only logging if the filesystem is not writable. If you see a crash, check the **Render Logs** tab for stack traces.

3. **MongoDB connection timeout** — If `MONGODB_URI` is wrong or Atlas Network Access does not include `0.0.0.0/0`, the connection hangs and Render kills the process.

4. **Memory limit** — Render free tier has 512 MB RAM. If the face-api model loading or other heavy operation exceeds this, the process is killed. Check Render dashboard for "OOM" (Out of Memory) notifications.

5. **Fix**: Verify all env vars are set, then **Manual Deploy → Deploy** to restart cleanly.

---

## Quick Reference

```bash
# Backend URLs
Render API:    https://smart-workplace-os-api.onrender.com
Health Check:  https://smart-workplace-os-api.onrender.com/api/health

# Frontend URLs
Vercel App:    https://your-app.vercel.app
Login Page:    https://your-app.vercel.app/login
