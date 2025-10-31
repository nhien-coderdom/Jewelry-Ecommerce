# 🔧 Fix Lỗi Railway Deployment - Dockerfile line 6

## ❌ Lỗi gặp phải:
```
Dockerfile:6
--------------------
   4 |     
   5 |     COPY package*.json ./
   6 | >>> RUN npm install
   7 |
   8 |     COPY . .
--------------------
```

## 🔍 Nguyên nhân:

Lỗi này xảy ra vì **Railway đang build từ root directory** (`/`) thay vì từ subdirectory (`/server` hoặc `/client`), nên không tìm thấy file `package.json`.

## ✅ Giải pháp:

### Bước 1: Cấu hình Railway Dashboard

#### Cho Server (Strapi):
1. Mở Railway Dashboard
2. Chọn Service **Server**
3. Vào **Settings** tab
4. Tìm mục **Build**:
   - **Root Directory**: `server`
   - **Dockerfile Path**: `Dockerfile.prod`
5. Click **Save**

#### Cho Client (Next.js):
1. Chọn Service **Client**
2. Vào **Settings** tab
3. Tìm mục **Build**:
   - **Root Directory**: `client`
   - **Dockerfile Path**: `Dockerfile.prod`
4. Click **Save**

### Bước 2: Re-deploy

```bash
# Option 1: Từ Railway Dashboard
Click vào service → "Deploy" → "Redeploy"

# Option 2: Push code mới
git add .
git commit -m "Fix Railway deployment config"
git push origin main
```

### Bước 3: Verify Build

Xem logs để confirm:
```
✅ Building from /server directory
✅ Found package.json
✅ Installing dependencies...
```

## 🎯 Cấu trúc Project đúng:

```
Jewelry-Ecommerce/
├── server/                 ← Service 1: Root = "server"
│   ├── package.json       ✅ Railway sẽ tìm thấy file này
│   ├── package-lock.json
│   ├── Dockerfile.prod    ← Dockerfile Path = "Dockerfile.prod"
│   └── ...
│
└── client/                 ← Service 2: Root = "client"
    ├── package.json       ✅ Railway sẽ tìm thấy file này
    ├── package-lock.json
    ├── Dockerfile.prod    ← Dockerfile Path = "Dockerfile.prod"
    └── ...
```

## 📋 Checklist Deploy Railway:

### Server Service:
- [ ] Root Directory = `server`
- [ ] Dockerfile Path = `Dockerfile.prod`
- [ ] Environment variables đã config (DATABASE_URL, APP_KEYS, etc.)
- [ ] PostgreSQL database đã tạo
- [ ] Port = `1337`

### Client Service:
- [ ] Root Directory = `client`
- [ ] Dockerfile Path = `Dockerfile.prod`
- [ ] Environment variables đã config (NEXT_PUBLIC_STRAPI_API_URL, etc.)
- [ ] Port = `3000`
- [ ] STRAPI_API_URL đã trỏ đúng server URL

## 🚀 Alternative: Deploy từ Separate Repos

Nếu vẫn gặp vấn đề, có thể tách ra 2 repos:

```bash
# Tạo repo riêng cho server
cd server
git init
git remote add origin <server-repo-url>
git push -u origin main

# Tạo repo riêng cho client
cd client
git init
git remote add origin <client-repo-url>
git push -u origin main
```

Sau đó deploy mỗi repo như 1 service riêng trên Railway.

## 🔍 Debug Commands:

```bash
# Check Railway CLI
railway --version

# Login
railway login

# Link to project
railway link

# Check logs
railway logs

# Deploy specific service
railway up --service=server
railway up --service=client
```

## 📞 Cần thêm help?

- Xem file: [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Lưu ý**: Sau khi fix xong, nhớ update CORS và URLs cho đúng!
