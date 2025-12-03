# CI/CD Guide - Jewelry Ecommerce Project

## 📋 Tổng quan

Project này sử dụng **GitHub Actions** để tự động hóa quá trình kiểm tra code (CI) và triển khai ứng dụng (CD).

---

## 🏗️ Kiến trúc CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Push Code                       │
│                            ↓                                 │
│                  GitHub Actions Trigger                      │
│                            ↓                                 │
│           ┌────────────────┴────────────────┐               │
│           ↓                                  ↓               │
│   Frontend Workflow              Backend Workflow            │
│   (deploy-frontend.yml)          (deploy-backend-render.yml)│
│           ↓                                  ↓               │
│   ┌───────────────┐                  ┌───────────────┐      │
│   │ 1. CI (Test)  │                  │ 1. CI (Test)  │      │
│   │   - Install   │                  │   - Install   │      │
│   │   - Lint      │                  │   - Lint      │      │
│   │   - Build     │                  │   - Build     │      │
│   └───────┬───────┘                  └───────┬───────┘      │
│           ↓                                  ↓               │
│   ┌───────────────┐                  ┌───────────────┐      │
│   │ 2. CD (Deploy)│                  │ 2. CD (Deploy)│      │
│   │   Only on     │                  │   Only on     │      │
│   │   main branch │                  │   main branch │      │
│   └───────┬───────┘                  └───────┬───────┘      │
│           ↓                                  ↓               │
│      Vercel (Frontend)              Render (Backend)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow hoạt động

### 1️⃣ Khi push code lên **bất kỳ nhánh nào**:

```
Developer push code
    ↓
GitHub Actions detect changes in client/** or server/**
    ↓
Run CI (Test) jobs
    ✅ Install dependencies
    ✅ Run lint (if available)
    ✅ Build project
    ✅ Run tests (if available)
    ↓
CI Success ✅ hoặc CI Failed ❌
```

**Kết quả:** Chỉ chạy **CI (kiểm tra code)**, không deploy.

---

### 2️⃣ Khi push code lên nhánh **main**:

```
Developer push to main
    ↓
GitHub Actions detect changes
    ↓
Step 1: Run CI (Test) jobs
    ✅ Install dependencies
    ✅ Lint code
    ✅ Build project
    ↓
CI Success? ──No──> ❌ Stop (không deploy)
    │
   Yes
    ↓
Step 2: Run CD (Deploy) jobs
    ✅ Deploy Frontend to Vercel
    ✅ Deploy Backend to Render
    ↓
CD Success ✅ → Website live!
```

**Kết quả:** Chạy cả **CI + CD** (test và deploy).

---

## 📂 Cấu trúc Workflows

### Frontend Workflow (`deploy-frontend.yml`)

| Trigger | Điều kiện |
|---------|-----------|
| **Push** | Nhánh: `**` (tất cả) <br> Files: `client/**`, `.github/workflows/deploy-frontend.yml` |
| **Pull Request** | Nhánh: `**` (tất cả) <br> Files: `client/**` |

**Jobs:**

1. **test-frontend** (chạy trên mọi nhánh)
   - Setup Node.js 18
   - Install dependencies (`npm ci`)
   - Lint code (`npm run lint`)

2. **deploy-vercel** (chỉ chạy trên `main`)
   - Condition: `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
   - Install Vercel CLI
   - Deploy to Vercel Production

---

### Backend Workflow (`deploy-backend-render.yml`)

| Trigger | Điều kiện |
|---------|-----------|
| **Push** | Nhánh: `**` (tất cả) <br> Files: `server/**`, `.github/workflows/deploy-backend-render.yml` |
| **Pull Request** | Nhánh: `**` (tất cả) <br> Files: `server/**` |

**Jobs:**

1. **test-backend** (chạy trên mọi nhánh)
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Lint code
   - Build Strapi (`npm run build`)
   - Run tests

2. **deploy-render** (chỉ chạy trên `main`)
   - Condition: `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`
   - Trigger Render Deploy Hook

---

## 🔐 GitHub Secrets (Bắt buộc)

Để CD hoạt động, cần cấu hình 4 secrets trong GitHub:

| Secret Name | Lấy từ đâu | Dùng cho |
|-------------|-----------|----------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens | Deploy Frontend |
| `VERCEL_ORG_ID` | `.vercel/project.json` hoặc `vercel teams ls` | Deploy Frontend |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` hoặc Vercel Settings | Deploy Frontend |
| `RENDER_DEPLOY_HOOK_URL` | Render → Service → Settings → Deploy Hook | Deploy Backend |

### Cách thêm Secrets:

1. Vào repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Nhập **Name** và **Value**
4. Click **Add secret**

---

## ✍️ Cách viết lệnh để CI/CD thành công

### ✅ Quy tắc cơ bản:

1. **Code phải pass lint và build**
   - Không có lỗi syntax
   - Không có lỗi TypeScript (nếu dùng)
   - Code format đúng chuẩn

2. **Commit message rõ ràng**
   ```bash
   # Good
   git commit -m "feat: add user profile popup"
   git commit -m "fix: resolve cart item duplication"
   git commit -m "chore: update dependencies"
   
   # Bad
   git commit -m "update"
   git commit -m "fix bug"
   ```

3. **Push đúng nhánh**
   ```bash
   # CI only (test trên nhánh feature)
   git push origin feature/your-branch
   
   # CI + CD (test và deploy)
   git push origin main
   ```

---

### 📋 Workflow đúng chuẩn:

#### Khi phát triển feature mới:

```bash
# 1. Tạo nhánh mới từ main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Code và commit
git add .
git commit -m "feat: add new feature"

# 3. Push và tạo Pull Request
git push origin feature/new-feature
# → CI sẽ chạy test tự động

# 4. Sau khi PR được approve, merge vào main
# → CI + CD sẽ chạy (test + deploy)
```

#### Khi fix bug khẩn cấp:

```bash
# 1. Tạo nhánh hotfix
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug

# 2. Fix bug và commit
git add .
git commit -m "fix: resolve critical payment bug"

# 3. Push và merge nhanh
git push origin hotfix/fix-critical-bug
# Merge vào main → Deploy ngay
```

---

## 🔍 Cách kiểm tra CI/CD thành công

### 1. Kiểm tra trên GitHub Actions

**Bước 1:** Mở GitHub Actions
```
https://github.com/nhien-coderdom/Jewelry-Ecommerce/actions
```

**Bước 2:** Tìm workflow run mới nhất (commit của bạn)

**Bước 3:** Kiểm tra status:

| Icon | Trạng thái | Ý nghĩa |
|------|------------|---------|
| 🟡 | In Progress | Đang chạy |
| ✅ | Success | Thành công |
| ❌ | Failed | Thất bại |

**Bước 4:** Click vào workflow để xem chi tiết

```
✅ test-frontend (hoặc test-backend)
    ✅ Checkout code
    ✅ Setup Node.js
    ✅ Install dependencies
    ✅ Lint code
    ✅ Build

✅ deploy-vercel (hoặc deploy-render) - chỉ trên main
    ✅ Checkout code
    ✅ Install Vercel CLI
    ✅ Deploy to Vercel
```

---

### 2. Kiểm tra trên Vercel (Frontend)

**Bước 1:** Mở Vercel Dashboard
```
https://vercel.com/
```

**Bước 2:** Chọn project `jewelry-ecommerce`

**Bước 3:** Kiểm tra tab **Deployments**
- Deployment mới nhất phải có status **Ready**
- Commit message khớp với commit bạn vừa push

**Bước 4:** Click **Visit** để xem website live

---

### 3. Kiểm tra trên Render (Backend)

**Bước 1:** Mở Render Dashboard
```
https://dashboard.render.com/
```

**Bước 2:** Chọn service `Jewelry-Ecommerce`

**Bước 3:** Kiểm tra tab **Events**
- Deploy mới nhất phải có status **Live**
- Thời gian deploy khớp với lúc push code

**Bước 4:** Click URL của service để kiểm tra API

---

### 4. Kiểm tra bằng Terminal

```bash
# Kiểm tra Vercel deployment
vercel ls

# Kiểm tra commit đã push
git log --oneline -5

# Kiểm tra nhánh hiện tại
git branch

# Kiểm tra remote
git remote -v
```

---

## 🐛 Troubleshooting (Xử lý lỗi)

### ❌ CI Failed - Build Error

**Nguyên nhân:** Code có lỗi syntax hoặc dependencies thiếu

**Cách fix:**
```bash
# 1. Kiểm tra lỗi trong GitHub Actions logs
# 2. Fix lỗi local
npm install
npm run build  # Phải pass

# 3. Commit và push lại
git add .
git commit -m "fix: resolve build error"
git push
```

---

### ❌ CI Failed - Lint Error

**Nguyên nhân:** Code không đúng chuẩn format

**Cách fix:**
```bash
# Auto fix lint errors
npm run lint -- --fix

# Commit
git add .
git commit -m "style: fix lint errors"
git push
```

---

### ❌ CD Failed - Deployment Error

**Nguyên nhân:** 
- Secrets chưa cấu hình
- Secrets sai
- Vercel/Render service down

**Cách fix:**

1. **Kiểm tra Secrets:**
   - GitHub → Settings → Secrets → Actions
   - Verify 4 secrets đã được thêm đúng

2. **Re-run workflow:**
   - GitHub Actions → Click workflow failed → Re-run jobs

3. **Kiểm tra logs:**
   - Click vào job failed → Đọc error message
   - Google error hoặc hỏi team

---

### ❌ Workflow không chạy

**Nguyên nhân:** Code không thay đổi trong `client/**` hoặc `server/**`

**Cách fix:**
```bash
# Thay đổi file trong client hoặc server
# Ví dụ: thêm comment trong code

git add .
git commit -m "chore: trigger CI/CD"
git push
```

---

## 📊 Metrics thành công

### ✅ CI/CD được coi là thành công khi:

1. **CI (Test):**
   - ✅ Install dependencies thành công
   - ✅ Lint pass (hoặc no lint errors)
   - ✅ Build pass
   - ✅ Tests pass (nếu có)

2. **CD (Deploy):**
   - ✅ Deploy job chạy (chỉ trên main)
   - ✅ Vercel deployment status = Ready
   - ✅ Render deployment status = Live
   - ✅ Website/API accessible và hoạt động đúng

3. **Time:**
   - CI: < 2 phút
   - CD (Vercel): 1-3 phút
   - CD (Render): 2-5 phút

---

## 🎯 Best Practices

### 1. Luôn test local trước khi push

```bash
# Frontend
cd client
npm install
npm run lint
npm run build

# Backend
cd server
npm install
npm run lint
npm run build
```

### 2. Sử dụng Pull Request cho features lớn

```bash
# Không push trực tiếp lên main
git push origin feature/big-feature

# Tạo PR → Review → Merge
```

### 3. Commit message theo convention

```
feat: thêm tính năng mới
fix: sửa lỗi
chore: cập nhật dependencies, config
docs: cập nhật documentation
style: format code, fix lint
refactor: tái cấu trúc code
test: thêm/sửa tests
```

### 4. Kiểm tra GitHub Actions sau mỗi push

```
1. Push code
2. Mở GitHub Actions
3. Đợi CI pass
4. Nếu main branch → kiểm tra deploy
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề với CI/CD:

1. **Kiểm tra logs:** GitHub Actions → Click vào workflow failed → Đọc error
2. **Hỏi team:** Slack/Discord channel
3. **Re-run workflow:** Có thể là lỗi tạm thời của GitHub/Vercel/Render

---

## 📚 Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)

---

**Cập nhật lần cuối:** 27/11/2025
