# 🚀 Quick Start - Deploy lên Railway

## TL;DR - Làm gì để fix lỗi?

### ❌ Lỗi hiện tại:
```
Dockerfile:6 - RUN npm install
Cannot find package.json
```

### ✅ Giải pháp (2 phút):

1. **Mở Railway Dashboard**
2. **Click vào Service (Server hoặc Client)**
3. **Settings → Build Section:**
   - **Root Directory**: `server` (cho server) hoặc `client` (cho client)
   - **Dockerfile Path**: `Dockerfile.prod`
4. **Click Save**
5. **Redeploy**

**XONG!** ✅

---

## 📚 Tài liệu chi tiết:

### 1. Fix lỗi ngay
👉 [FIX_RAILWAY_ERROR.md](./FIX_RAILWAY_ERROR.md) - Fix lỗi deployment

### 2. Hướng dẫn deploy đầy đủ
👉 [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md) - Hướng dẫn từng bước

### 3. Checklist deployment
👉 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Tick từng bước

### 4. Environment variables
👉 [.env.railway.example](./.env.railway.example) - Template cho Railway

---

## 🔐 Generate Secrets (1 phút):

```bash
node generate-secrets.js
```

Copy output vào Railway Environment Variables.

---

## 🧪 Test Build Locally (5 phút):

```powershell
# Windows PowerShell
.\test-railway-build.ps1

# Hoặc manual
cd server
docker build -f Dockerfile.prod -t test-server .

cd ../client  
docker build -f Dockerfile.prod -t test-client .
```

---

## 📊 Project Structure trên Railway:

```
Railway Project: Jewelry-Ecommerce
│
├── 💾 Database (PostgreSQL)
│   └── Auto-generates connection vars
│
├── 🖥️ Server Service
│   ├── Root Directory: server
│   ├── Dockerfile: Dockerfile.prod
│   ├── Port: 1337
│   └── URL: https://xxx.railway.app
│
└── 🌐 Client Service
    ├── Root Directory: client
    ├── Dockerfile: Dockerfile.prod
    ├── Port: 3000
    └── URL: https://yyy.railway.app
```

---

## 🎯 Deploy Order:

1. **Database** → Create PostgreSQL
2. **Server** → Deploy với database vars
3. **Client** → Deploy với server URL
4. **Update** → Update server với client URL

---

## ⚡ Commands:

```bash
# Generate secrets
node generate-secrets.js

# Test builds locally
.\test-railway-build.ps1

# Deploy via Railway CLI (optional)
railway login
railway link
railway up

# Check logs
railway logs
```

---

## 🐛 Common Issues:

| Issue | Solution |
|-------|----------|
| Build fails at npm install | Set Root Directory |
| Can't connect to database | Check DATABASE_URL var |
| CORS error | Update CLIENT_URL on server |
| 502 Bad Gateway | Service restarting, wait 1 min |

---

## 💡 Tips:

- ✅ Deploy server trước, client sau
- ✅ Generate secrets riêng cho production
- ✅ Test locally trước khi deploy
- ✅ Monitor logs sau khi deploy
- ✅ Keep secrets safe, don't commit

---

## 🆘 Help:

- **Lỗi deploy**: [FIX_RAILWAY_ERROR.md](./FIX_RAILWAY_ERROR.md)
- **Full guide**: [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)
- **Railway Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway

---

**Made with ❤️ - Happy Deploying! 🚀**
