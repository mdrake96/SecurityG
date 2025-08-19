# Complete Deployment Setup Guide

## 1. Backend Deployment (Render)

### Initial Setup
1. Push your repo to GitHub
2. Go to [Render](https://render.com) and create account
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Render will detect `render.yaml` and auto-configure the service

### Environment Variables (set in Render dashboard)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret (e.g., use a password generator)
- `FRONTEND_URL`: Your final frontend URL (e.g., `https://your-app.vercel.app`)

### GitHub Actions Setup (optional)
1. In Render dashboard, copy your service ID
2. Generate a Render API key: Account → API Keys → Create
3. In GitHub repo: Settings → Secrets and variables → Actions
4. Add secrets:
   - `RENDER_SERVICE_ID`: Your service ID
   - `RENDER_API_KEY`: Your API key

## 2. Frontend Deployment (Vercel)

### Initial Setup
1. Go to [Vercel](https://vercel.com) and create account
2. Click "New Project"
3. Import your GitHub repo
4. Set project root to `frontend`
5. Vercel will auto-detect the `vercel.json` config

### Environment Variables (set in Vercel dashboard)
- `REACT_APP_API_BASE`: Your Render backend URL (e.g., `https://your-backend.onrender.com`)
- `REACT_APP_SOCKET_URL`: Same as above

### GitHub Actions Setup (optional)
1. In Vercel dashboard: Settings → General → Project ID (copy it)
2. Go to Account → Tokens → Create
3. In GitHub repo: Settings → Secrets and variables → Actions
4. Add secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `ORG_ID`: Your Vercel organization ID
   - `PROJECT_ID`: Your project ID

## 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Create database user with password
4. Get connection string: Clusters → Connect → Connect your application
5. Replace `<password>` with your actual password
6. Copy the full connection string to Render's `MONGODB_URI`

## 4. Final Steps

1. Deploy backend first (Render)
2. Copy the Render URL
3. Set `REACT_APP_API_BASE` and `REACT_APP_SOCKET_URL` in Vercel
4. Deploy frontend (Vercel)
5. Copy the Vercel URL
6. Set `FRONTEND_URL` in Render
7. Redeploy backend

## 5. Auto-Deployment

With GitHub Actions configured:
- Push to `main` branch with backend changes → auto-deploys to Render
- Push to `main` branch with frontend changes → auto-deploys to Vercel

## URLs to Remember
- Backend: `https://your-backend.onrender.com`
- Frontend: `https://your-app.vercel.app`
- API calls: Frontend will proxy `/api/*` to backend
- WebSocket: Frontend connects directly to backend for real-time features
