# Backend Deployment (Render)

1. Create a MongoDB Atlas cluster and get your connection string.
2. Push this repo to GitHub.
3. In Render:
   - New Web Service → select this repo
   - Root/Monorepo path: `backend`
   - Build command: `npm ci && npm run build`
   - Start command: `npm run start`
   - Environment:
     - `MONGODB_URI` → your Atlas URI
     - `JWT_SECRET` → strong secret
     - `FRONTEND_URL` → the publicly accessible frontend URL
4. Deploy. Render will give you a public backend URL.
