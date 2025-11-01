# 🚀 GitHub Actions CI/CD Setup Guide

## 📋 Required GitHub Secrets

Để GitHub Actions workflows hoạt động, cần thêm các secrets sau:

### Repository Settings → Secrets and variables → Actions → New repository secret

### 🎯 Backend (Render) Secrets:

```
RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxxx
RENDER_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=xxxxxxxx
```

**Cách lấy:**
1. **RENDER_API_KEY**: Render Dashboard → Account Settings → API Keys → Create API Key
2. **RENDER_SERVICE_ID**: Vào service jewelry-backend → URL có dạng `/service/srv-abc123` → copy `srv-abc123`
3. **RENDER_DEPLOY_HOOK_URL**: Service Settings → Deploy Hook → Copy URL

### 🎯 Frontend (Vercel) Secrets:

```
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxxxxxxxxxx  
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxxx
```

**Cách lấy:**
1. **VERCEL_TOKEN**: Vercel Dashboard → Settings → Tokens → Create Token
2. **VERCEL_ORG_ID**: Vercel CLI: `vercel --version && vercel` → copy Organization ID
3. **VERCEL_PROJECT_ID**: Project Settings → General → Project ID

### 🎯 Environment Variables (cho build):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHER_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Lấy từ file `.env` trong client/**

---

## 🔄 CI/CD Workflow

### Trigger Conditions:

**Backend Deploy:**
- Push to `main` hoặc `feature/phase2`
- Thay đổi trong folder `server/`
- ✅ Test → 🚀 Deploy to Render

**Frontend Deploy:**
- Push to `main` hoặc `feature/phase2` 
- Thay đổi trong folder `client/`
- ✅ Test → 🚀 Deploy to Vercel

### Manual Deploy:
```bash
# Trigger backend deploy
git commit --allow-empty -m "Deploy backend"
git push origin main

# Trigger frontend deploy  
git commit --allow-empty -m "Deploy frontend"
git push origin main
```

---

## 🐛 Troubleshooting

### ❌ Backend deployment fails:
- Check RENDER_API_KEY is valid (not expired)
- Verify RENDER_SERVICE_ID matches your service
- Ensure Render service has all environment variables

### ❌ Frontend deployment fails:
- Check VERCEL_TOKEN has write permissions
- Verify VERCEL_PROJECT_ID is correct
- Ensure all NEXT_PUBLIC_* secrets are set

### ❌ Build fails:
- Check Node.js version compatibility (18-20)
- Verify all dependencies in package-lock.json
- Check environment variables format

---

## 📊 Current Deployment URLs

- **Backend (Render)**: https://jewelry-ecommerce-l2ju.onrender.com
- **Frontend (Vercel)**: https://jewelry-ecommerce-l2h6rgdwb-joppys-projects.vercel.app
- **Admin Panel**: https://jewelry-ecommerce-l2ju.onrender.com/admin
- **API Docs**: https://jewelry-ecommerce-l2ju.onrender.com/documentation

---

## 👥 Team Workflow

1. **Clone repo**: `git clone https://github.com/nhien-coderdom/Jewelry-Ecommerce.git`
2. **Checkout branch**: `git checkout feature/phase2`
3. **Setup local**: Follow `DEVELOPMENT_GUIDE.md`
4. **Make changes**: Edit code in `server/` or `client/`
5. **Test local**: `npm test` (if available)
6. **Commit & Push**: GitHub Actions auto-deploy!

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/phase2
# 🚀 Auto-deploy triggered!
```