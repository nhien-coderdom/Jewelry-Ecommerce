# 🚀 CI/CD Setup Guide - Railway + Vercel

## Tổng quan

- **Backend (Strapi)** → Railway
- **Frontend (Next.js)** → Vercel
- **Auto Deploy**: Push code → Test pass → Deploy tự động

## 📋 Workflow đã tạo

1. `.github/workflows/deploy-backend.yml` - Deploy backend lên Railway
2. `.github/workflows/deploy-frontend.yml` - Deploy frontend lên Vercel

---

## 🔧 Setup Railway (Backend)

### 1. Tạo project trên Railway

1. Truy cập: https://railway.app
2. Login với GitHub
3. Click "New Project" → "Empty Project"
4. Đặt tên: `jewelry-ecommerce`

### 2. Tạo PostgreSQL Database

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway tự động provision database

### 3. Tạo Server Service

1. Click "New" → "GitHub Repo" → Chọn repo `Jewelry-Ecommerce`
2. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 4. Configure Environment Variables

Vào Server service → Variables, thêm:

```env
# Database (Railway auto-inject)
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_USERNAME=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_SSL=false

# Strapi Secrets (generate mới!)
APP_KEYS=your-keys-here
API_TOKEN_SALT=your-salt-here
ADMIN_JWT_SECRET=your-secret-here
TRANSFER_TOKEN_SALT=your-salt-here
JWT_SECRET=your-secret-here

# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Cloudinary
CLOUDINARY_NAME=your-name
CLOUDINARY_KEY=your-key
CLOUDINARY_SECRET=your-secret

# Client URL (update sau khi deploy frontend)
CLIENT_URL=https://your-vercel-url.vercel.app
```

### 5. Lấy Railway Token cho GitHub Actions

1. Railway Dashboard → Account Settings → Tokens
2. Click "Create Token"
3. Copy token
4. Vào GitHub repo → Settings → Secrets → New secret
   - Name: `RAILWAY_TOKEN`
   - Value: paste token

### 6. Lấy Railway Project ID (optional)

1. Trong Railway project URL: `railway.app/project/abc123...`
2. Copy `abc123...`
3. GitHub Secrets → New secret:
   - Name: `RAILWAY_PROJECT_ID`
   - Value: paste project ID

---

## 🌐 Setup Vercel (Frontend)

### 1. Tạo project trên Vercel

1. Truy cập: https://vercel.com
2. Login với GitHub
3. Click "Add New..." → "Project"
4. Import repo `Jewelry-Ecommerce`
5. Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Configure Environment Variables

Trong Vercel project → Settings → Environment Variables:

```env
# Strapi API (Railway URL)
NEXT_PUBLIC_STRAPI_API_URL=https://your-railway-url.railway.app/api
NEXT_PUBLIC_STRAPI_URL=https://your-railway-url.railway.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Resend
RESEND_API_KEY=re_xxx

# Next.js
NODE_ENV=production
```

### 3. Lấy Vercel Token cho GitHub Actions

1. Vercel → Account Settings → Tokens
2. Create Token → Copy
3. GitHub Secrets → New secret:
   - Name: `VERCEL_TOKEN`
   - Value: paste token

### 4. Lấy Vercel Org ID và Project ID

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd client
vercel link

# Lấy IDs
cat .vercel/project.json
```

Copy `orgId` và `projectId`, thêm vào GitHub Secrets:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 🔐 GitHub Secrets Checklist

Vào GitHub repo → Settings → Secrets and variables → Actions

### Railway Secrets:
- [ ] `RAILWAY_TOKEN` - Token từ Railway
- [ ] `RAILWAY_PROJECT_ID` - Project ID (optional)

### Vercel Secrets:
- [ ] `VERCEL_TOKEN` - Token từ Vercel
- [ ] `VERCEL_ORG_ID` - Organization ID
- [ ] `VERCEL_PROJECT_ID` - Project ID

### Environment Variables (for build):
- [ ] `NEXT_PUBLIC_STRAPI_API_URL` - Railway backend URL
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk key

---

## 🚀 Deployment Flow

### Automatic Deployment:

```
Developer Push Code
       ↓
GitHub Actions Triggered
       ↓
┌──────────────────┐  ┌──────────────────┐
│  Backend Test    │  │  Frontend Test   │
│  - npm ci        │  │  - npm ci        │
│  - npm build     │  │  - npm build     │
└────────┬─────────┘  └────────┬─────────┘
         ↓                     ↓
    Tests Pass?           Tests Pass?
         ↓                     ↓
   ✅ Deploy to          ✅ Deploy to
      Railway               Vercel
         ↓                     ↓
Backend Running        Frontend Running
```

### Manual Deployment:

```bash
# Railway (Backend)
cd server
railway login
railway link
railway up

# Vercel (Frontend)
cd client
vercel login
vercel link
vercel --prod
```

---

## 📝 Workflow Features

### Backend Workflow (Railway):
- ✅ Trigger: Push to `server/**` folder
- ✅ Test: Install deps, build check, lint
- ✅ Deploy: Auto deploy to Railway if tests pass
- ✅ Branches: `main`, `feature/phase2`

### Frontend Workflow (Vercel):
- ✅ Trigger: Push to `client/**` folder
- ✅ Test: Install deps, build Next.js, lint
- ✅ Deploy: Auto deploy to Vercel if tests pass
- ✅ Branches: `main`, `feature/phase2`

---

## 🔄 Update URLs

### Sau khi deploy:

1. **Backend URL** (Railway): `https://xxx.railway.app`
2. **Frontend URL** (Vercel): `https://xxx.vercel.app`

### Update các chỗ sau:

#### Railway Environment Variables:
```env
CLIENT_URL=https://your-vercel-url.vercel.app
```

#### Vercel Environment Variables:
```env
NEXT_PUBLIC_STRAPI_API_URL=https://your-railway-url.railway.app/api
NEXT_PUBLIC_STRAPI_URL=https://your-railway-url.railway.app
```

#### Update CORS trong `server/config/middlewares.js`:
```javascript
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: [
      'https://your-vercel-url.vercel.app',
      'http://localhost:3000'
    ],
    credentials: true,
  },
}
```

---

## 🧪 Test Deployment

### 1. Test trên local trước:

```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
npm start
```

### 2. Push to trigger deployment:

```bash
git add .
git commit -m "Setup CI/CD with Railway and Vercel"
git push origin feature/phase2
```

### 3. Monitor deployment:

- GitHub: Actions tab
- Railway: Project → Deployments
- Vercel: Project → Deployments

---

## 📊 Monitoring

### Railway:
- Logs: Railway Dashboard → Service → Logs
- Metrics: CPU, Memory, Network usage
- Database: PostgreSQL metrics

### Vercel:
- Logs: Vercel Dashboard → Project → Deployments → Logs
- Analytics: Vercel Analytics
- Performance: Web Vitals

---

## 🐛 Troubleshooting

### Backend không deploy:
1. Check Railway Token trong GitHub Secrets
2. Check build logs trong GitHub Actions
3. Verify environment variables trong Railway
4. Check database connection

### Frontend không deploy:
1. Check Vercel Token trong GitHub Secrets
2. Verify VERCEL_ORG_ID và VERCEL_PROJECT_ID
3. Check build logs trong GitHub Actions
4. Verify environment variables trong Vercel

### CORS errors:
1. Update CLIENT_URL trong Railway
2. Update CORS config trong `server/config/middlewares.js`
3. Redeploy backend

---

## 💡 Tips

- ✅ Test locally trước khi push
- ✅ Monitor logs sau khi deploy
- ✅ Keep secrets safe, không commit vào Git
- ✅ Update URLs sau mỗi lần deploy
- ✅ Use environment-specific configs
- ✅ Enable preview deployments cho PR

---

## 📚 Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/en/actions
- Railway CLI: https://docs.railway.app/develop/cli
- Vercel CLI: https://vercel.com/docs/cli

---

**Setup by: Team Jewelry E-commerce**
**Date: 2025-11-01**
