# 🎯 JEWELRY E-COMMERCE - TÀI LIỆU TỔNG HỢP

## 📖 MỤC LỤC
1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc & Workflow](#kiến-trúc--workflow)
3. [Development (Local)](#development-local)
4. [Production (Deploy)](#production-deploy)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Hướng dẫn cho Team](#hướng-dẫn-cho-team)

---

## 🌐 TỔNG QUAN HỆ THỐNG

### Công nghệ sử dụng:
```
Backend:  Strapi 4.21.0 (Headless CMS)
Frontend: Next.js 14.1.4
Database: PostgreSQL 15
Auth:     Clerk
Payment:  Stripe
Upload:   Cloudinary
```

### Môi trường:
```
LOCAL:       Docker Compose (http://localhost:3000)
PRODUCTION:  Render (Backend) + Vercel (Frontend)
```

---

## 🏗️ KIẾN TRÚC & WORKFLOW

### 📊 SƠ ĐỒ KIẾN TRÚC

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT (Local)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Docker Compose (docker-compose.yml)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Postgres   │  │    Strapi    │  │    Next.js      │  │
│  │   :5432      │◄─┤    :1337     │◄─┤     :3000       │  │
│  │ (Container)  │  │  (Container) │  │   (Container)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  Chạy: docker-compose up -d                                 │
│  File: .env (local database config)                         │
└─────────────────────────────────────────────────────────────┘

                            ⬇️  Git Push

┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Branch: feature/phase2 ──Push──> main                     │
│                                                              │
│  Triggers:                                                   │
│  ├─ .github/workflows/deploy-backend-render.yml            │
│  └─ .github/workflows/deploy-frontend.yml                  │
└─────────────────────────────────────────────────────────────┘

            ⬇️                              ⬇️
     GitHub Actions                   GitHub Actions
            ⬇️                              ⬇️

┌────────────────────────┐      ┌──────────────────────────┐
│   RENDER (Backend)     │      │   VERCEL (Frontend)      │
├────────────────────────┤      ├──────────────────────────┤
│                        │      │                          │
│  ┌──────────────────┐ │      │  ┌────────────────────┐ │
│  │ PostgreSQL DB    │ │      │  │    Next.js App     │ │
│  │ (Managed)        │ │      │  │   (Static + SSR)   │ │
│  └─────────┬────────┘ │      │  └─────────┬──────────┘ │
│            │          │      │            │            │
│  ┌─────────▼────────┐ │      │            │            │
│  │  Strapi Backend  │ │      │     API calls           │
│  │  Node.js App     │◄├──────┼────────────┘            │
│  └──────────────────┘ │      │                          │
│                        │      │                          │
│  jewelry-ecommerce-    │      │  jewelry-ecommerce-      │
│  l2ju.onrender.com     │      │  xxx.vercel.app          │
└────────────────────────┘      └──────────────────────────┘
```

---

## 🔍 CÁC THÀNH PHẦN GIẢI THÍCH CHI TIẾT

### 1️⃣ DOCKER & DOCKER COMPOSE

#### **Docker là gì?**
- **Container**: Như một "máy ảo" nhẹ, chứa app + dependencies
- **Image**: Template để tạo container
- **Dockerfile**: File hướng dẫn build image

#### **Docker Compose là gì?**
- **Orchestration tool**: Quản lý nhiều containers cùng lúc
- **File**: `docker-compose.yml`
- **Chạy 3 services cùng lúc**: Postgres + Backend + Frontend

#### **Khi nào dùng?**
✅ **Development local**: Chạy toàn bộ app trên máy tính
❌ **Production**: KHÔNG deploy Docker lên server (dùng Render/Vercel)

#### **Commands:**
```powershell
# Start tất cả containers
docker-compose up -d

# Xem containers đang chạy
docker-compose ps

# Dừng tất cả
docker-compose down

# Rebuild khi code thay đổi
docker-compose up -d --build

# Xem logs
docker-compose logs -f server
```

---

### 2️⃣ DOCKERFILE

#### **Là gì?**
File chứa instructions để build Docker image cho một service.

#### **Ví dụ: `server/Dockerfile`**
```dockerfile
FROM node:18-alpine          # Base image: Node.js 18
WORKDIR /app                  # Working directory
COPY package*.json ./         # Copy package files
RUN npm install               # Install dependencies
COPY . .                      # Copy source code
EXPOSE 1337                   # Expose port
CMD ["npm", "run", "dev"]     # Start command
```

#### **Khi nào rebuild?**
- Khi thêm npm packages mới
- Khi thay đổi Dockerfile
- Command: `docker-compose up -d --build`

---

### 3️⃣ RENDER.COM (Backend Production)

#### **Là gì?**
- **Cloud platform**: Deploy backend + database lên internet
- **Managed services**: Render quản lý server, auto-scale, backup
- **Free tier**: 750 giờ/tháng

#### **Services:**
1. **PostgreSQL Database** (Managed)
   - URL: `postgresql://user:pass@host.render.com:5432/db`
   - Auto-backup
   - SSL required

2. **Web Service** (Backend)
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - URL: https://jewelry-ecommerce-l2ju.onrender.com

#### **Environment Variables:**
Set trên Dashboard, KHÔNG đọc từ file `.env`
```
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://...
APP_KEYS=...
JWT_SECRET=...
```

#### **Deployment:**
- **Auto**: Push to GitHub → Render tự động build
- **Manual**: Dashboard → Deploy → Manual Deploy

---

### 4️⃣ VERCEL (Frontend Production)

#### **Là gì?**
- **Cloud platform**: Chỉ deploy frontend (Next.js, React)
- **Features**: CDN global, auto-scaling, zero-config
- **Free tier**: Unlimited deployments

#### **Deployment:**
- **Auto**: Push to GitHub → Vercel tự động deploy
- **URL**: https://jewelry-ecommerce-xxx.vercel.app

#### **Environment Variables:**
```
NEXT_PUBLIC_REST_API_URL=https://jewelry-ecommerce-l2ju.onrender.com/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHER_KEY=pk_test_...
```

---

### 5️⃣ GITHUB ACTIONS (CI/CD)

#### **Là gì?**
- **CI/CD tool**: Automation workflow chạy trên GitHub
- **Trigger**: Khi push code lên GitHub
- **Files**: `.github/workflows/*.yml`

#### **Workflow:**

**Backend Deploy (deploy-backend-render.yml):**
```yaml
Trigger: Push to main + thay đổi trong server/
Jobs:
  1. test-backend:
     - Checkout code
     - Install Node.js
     - npm ci (install)
     - npm run build
     - npm test (if exists)
  
  2. deploy-render:
     - Gọi Render API hoặc webhook
     - Trigger deployment
     - Wait for success
```

**Frontend Deploy (deploy-frontend.yml):**
```yaml
Trigger: Push to main + thay đổi trong client/
Jobs:
  1. test-frontend:
     - Checkout code
     - Install Node.js
     - npm ci
     - npm run build
  
  2. deploy-vercel:
     - Install Vercel CLI
     - vercel build --prod
     - vercel deploy --prod
```

#### **GitHub Secrets (Required):**
Repository → Settings → Secrets:
```
RENDER_API_KEY=rnd_xxx
RENDER_SERVICE_ID=srv_xxx
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx
```

---

## 🔄 WORKFLOW HOÀN CHỈNH

### 📝 TỪNG BƯỚC CHI TIẾT:

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: DEVELOP LOCAL (Máy tính của bạn)                    │
└─────────────────────────────────────────────────────────────┘
  
  1. Clone repo:
     git clone https://github.com/nhien-coderdom/Jewelry-Ecommerce.git
  
  2. Checkout branch:
     git checkout feature/phase2
  
  3. Start Docker Desktop (GUI)
  
  4. Run containers:
     docker-compose up -d
  
  5. Access:
     Frontend:  http://localhost:3000
     Backend:   http://localhost:1337/admin
  
  6. Code changes:
     - Edit files in server/ or client/
     - Save → Auto-reload (hot reload)
  
  7. Stop containers:
     docker-compose down

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: COMMIT & PUSH (Git)                                 │
└─────────────────────────────────────────────────────────────┘
  
  git add .
  git commit -m "feat: add new feature"
  git push origin feature/phase2

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: GITHUB ACTIONS (Tự động)                            │
└─────────────────────────────────────────────────────────────┘
  
  GitHub detects push → Triggers workflows
  
  Backend Workflow (.github/workflows/deploy-backend-render.yml):
    ✅ Run tests
    ✅ Build Strapi
    ✅ Call Render API
    ✅ Render rebuilds & redeploys
  
  Frontend Workflow (.github/workflows/deploy-frontend.yml):
    ✅ Run tests
    ✅ Build Next.js
    ✅ Deploy to Vercel

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: PRODUCTION LIVE (Internet)                          │
└─────────────────────────────────────────────────────────────┘
  
  Backend:  https://jewelry-ecommerce-l2ju.onrender.com
  Frontend: https://jewelry-ecommerce-xxx.vercel.app
  Admin:    https://jewelry-ecommerce-l2ju.onrender.com/admin
```

---

## 💻 DEVELOPMENT (LOCAL)

### Cách chạy code trên máy:

```powershell
# 1. Mở Docker Desktop (GUI) - BẮT BUỘC!

# 2. Vào thư mục project
cd D:\Test\Jewelry-Ecommerce

# 3. Start containers
docker-compose up -d

# 4. Truy cập:
# - Frontend: http://localhost:3000
# - Admin:    http://localhost:1337/admin

# 5. Khi code xong, dừng containers:
docker-compose down
```

### File quan trọng:

```
docker-compose.yml        # Định nghĩa 3 services (postgres, server, client)
server/.env               # Env vars cho local (DATABASE_HOST=postgres)
server/Dockerfile         # Build image cho backend
client/Dockerfile         # Build image cho frontend
```

### Debug:

```powershell
# Xem logs
docker-compose logs -f

# Restart container
docker-compose restart server

# Rebuild
docker-compose up -d --build
```

---

## 🚀 PRODUCTION (DEPLOY)

### Backend (Render):

**Setup:**
1. Render Dashboard → New PostgreSQL
2. New Web Service → Connect GitHub repo
3. Root Directory: `server`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add Environment Variables (Dashboard)

**Deployment:**
- **Auto**: Push to GitHub → GitHub Actions → Render API → Deploy
- **Manual**: Render Dashboard → Deploy

**URLs:**
- Backend: https://jewelry-ecommerce-l2ju.onrender.com
- Admin: https://jewelry-ecommerce-l2ju.onrender.com/admin
- API: https://jewelry-ecommerce-l2ju.onrender.com/api

### Frontend (Vercel):

**Setup:**
1. Vercel Dashboard → Import Project
2. Connect GitHub repo
3. Root Directory: `client`
4. Framework: Next.js (auto-detect)
5. Add Environment Variables

**Deployment:**
- **Auto**: Push to GitHub → GitHub Actions → Vercel CLI → Deploy
- **Manual**: Vercel Dashboard → Redeploy

---

## ⚙️ CI/CD PIPELINE

### Tại sao cần CI/CD?

❌ **TRƯỚC ĐÂY (Manual):**
```
Code xong → Build local → Upload lên server → Config → Deploy
❌ Mất thời gian
❌ Dễ sai sót
❌ Không tự động test
```

✅ **BÂY GIỜ (CI/CD):**
```
Code xong → Push GitHub → Tự động test → Tự động deploy
✅ Nhanh (30s - 3 phút)
✅ Đảm bảo chất lượng (test trước khi deploy)
✅ Tự động hóa hoàn toàn
```

### GitHub Actions làm gì?

**Workflow Backend:**
```
1. Trigger: Push code có thay đổi server/
2. Checkout code từ GitHub
3. Setup Node.js 20
4. npm ci (install dependencies)
5. npm run build (build Strapi)
6. npm test (if exists)
7. Call Render API để trigger deploy
8. Wait for deploy success
```

**Workflow Frontend:**
```
1. Trigger: Push code có thay đổi client/
2. Checkout code từ GitHub
3. Setup Node.js 20
4. npm ci
5. npm run build (build Next.js)
6. Vercel CLI: vercel deploy --prod
```

### Setup GitHub Secrets:

Repository → Settings → Secrets and variables → Actions:

```
RENDER_API_KEY          # Từ Render Account Settings
RENDER_SERVICE_ID       # Từ Render Service URL
RENDER_DEPLOY_HOOK_URL  # Từ Render Service Settings

VERCEL_TOKEN            # Từ Vercel Account Settings
VERCEL_ORG_ID           # Từ Vercel CLI
VERCEL_PROJECT_ID       # Từ Vercel Project Settings
```

Chi tiết: Xem file `GITHUB_ACTIONS_SETUP.md`

---

## 👥 HƯỚNG DẪN CHO TEAM

### 🆕 Team member mới vào project:

```powershell
# 1. Clone repo
git clone https://github.com/nhien-coderdom/Jewelry-Ecommerce.git
cd Jewelry-Ecommerce

# 2. Checkout branch develop
git checkout feature/phase2

# 3. Cài Docker Desktop (nếu chưa có)
# Download: https://www.docker.com/products/docker-desktop/

# 4. Start Docker Desktop (mở GUI)

# 5. Run app local
docker-compose up -d

# 6. Access:
# Frontend: http://localhost:3000
# Admin: http://localhost:1337/admin
```

### 📝 Workflow hàng ngày:

```powershell
# Buổi sáng - Start work:
docker-compose up -d

# Làm việc:
# - Edit code
# - Test local: http://localhost:3000
# - Commit thường xuyên

# Commit code:
git add .
git commit -m "feat: your feature description"

# Push (sẽ tự động deploy nếu push lên main):
git push origin feature/phase2

# Buổi tối - End work:
docker-compose down
```

### 🔀 Merge vào main:

```powershell
# 1. Đảm bảo feature/phase2 đã update
git checkout feature/phase2
git pull origin feature/phase2

# 2. Chuyển sang main
git checkout main
git pull origin main

# 3. Merge feature vào main
git merge feature/phase2

# 4. Push (sẽ trigger CI/CD tự động deploy)
git push origin main

# 5. Kiểm tra GitHub Actions:
# → Repository → Actions tab
# → Xem workflows đang chạy

# 6. Sau 3-5 phút, check production:
# Backend: https://jewelry-ecommerce-l2ju.onrender.com
# Frontend: https://jewelry-ecommerce-xxx.vercel.app
```

---

## 🎯 TÓM TẮT NHANH

### Local Development:
```
Docker Desktop ON → docker-compose up -d → Code → Save
→ Test: http://localhost:3000
```

### Deploy Production:
```
Code → git commit → git push origin main
→ GitHub Actions tự động test + deploy
→ Live sau 3-5 phút
```

### Files quan trọng:
```
docker-compose.yml           # Local: Định nghĩa 3 containers
.github/workflows/*.yml      # CI/CD: Auto deploy
server/.env                  # Local: Database config
GITHUB_ACTIONS_SETUP.md      # Hướng dẫn setup secrets
```

### URLs:
```
LOCAL:
- Frontend: http://localhost:3000
- Backend:  http://localhost:1337/admin

PRODUCTION:
- Frontend: https://jewelry-ecommerce-xxx.vercel.app
- Backend:  https://jewelry-ecommerce-l2ju.onrender.com
- Admin:    https://jewelry-ecommerce-l2ju.onrender.com/admin
```

---

## 📚 TÀI LIỆU KHÁC

- `TEAM_DOCKER_GUIDE.md` - Hướng dẫn Docker chi tiết
- `GITHUB_ACTIONS_SETUP.md` - Setup CI/CD secrets
- `CI_CD_SETUP.md` - Railway deploy guide (old)
- `MIGRATION_GUIDE.md` - SQLite → PostgreSQL migration

---

## ❓ FAQ

**Q: Tại sao cần Docker cho local nhưng không dùng cho production?**  
A: Docker tốt cho local vì setup nhanh, nhất quán. Production dùng Render/Vercel vì họ quản lý infrastructure, scaling, monitoring tốt hơn.

**Q: Khi nào code mới lên production?**  
A: Khi push vào branch `main`. Branch khác (feature/phase2) không tự động deploy.

**Q: Làm sao biết deploy thành công?**  
A: Check GitHub Actions tab → workflows có dấu ✅ xanh. Hoặc test URL production.

**Q: Docker không chạy được?**  
A: Đảm bảo Docker Desktop đang mở và status "Running". Restart nếu cần.

**Q: CI/CD fail?**  
A: Check GitHub Secrets đã setup chưa. Xem logs trong Actions tab.

---

🎉 **Chúc team code vui vẻ!**