# 🚀 Railway Deployment - Visual Guide

## ❌ LỖI ĐANG GẶP:

```
Dockerfile:6
--------------------
   4 |     
   5 |     COPY package*.json ./
   6 | >>> RUN npm install  ❌ ERROR HERE
   7 |
   8 |     COPY . .
--------------------
Error: Cannot find package.json
```

**Nguyên nhân**: Railway đang build từ `/` thay vì `/server` hoặc `/client`

---

## ✅ GIẢI PHÁP (Hình minh họa):

### Step 1: Mở Railway Dashboard
```
https://railway.app/dashboard
  ↓
Click vào PROJECT của bạn
  ↓
Click vào SERVICE (Server hoặc Client)
```

### Step 2: Vào Settings
```
┌─────────────────────────────────────┐
│  Service: jewelry-server            │
├─────────────────────────────────────┤
│  [Deployments] [Settings] [Metrics] │  ← Click Settings
└─────────────────────────────────────┘
```

### Step 3: Tìm Build Section
```
Settings
├── General
├── Environment
└── ⭐ Build  ← Scroll xuống đây
    ├── Builder: Dockerfile
    ├── 📁 Root Directory: _______  ← ĐÂY!
    ├── 📄 Dockerfile Path: ______ ← VÀ ĐÂY!
    └── [Save Changes]
```

### Step 4: Điền thông tin

#### Cho SERVER:
```
┌────────────────────────────────────────┐
│ 📁 Root Directory                      │
│ ┌────────────────────────────────────┐ │
│ │ server                             │ │ ← Type "server"
│ └────────────────────────────────────┘ │
│                                        │
│ 📄 Dockerfile Path                     │
│ ┌────────────────────────────────────┐ │
│ │ Dockerfile.prod                    │ │ ← Type "Dockerfile.prod"
│ └────────────────────────────────────┘ │
│                                        │
│          [Save Changes] ✅             │
└────────────────────────────────────────┘
```

#### Cho CLIENT:
```
┌────────────────────────────────────────┐
│ 📁 Root Directory                      │
│ ┌────────────────────────────────────┐ │
│ │ client                             │ │ ← Type "client"
│ └────────────────────────────────────┘ │
│                                        │
│ 📄 Dockerfile Path                     │
│ ┌────────────────────────────────────┐ │
│ │ Dockerfile.prod                    │ │ ← Type "Dockerfile.prod"
│ └────────────────────────────────────┘ │
│                                        │
│          [Save Changes] ✅             │
└────────────────────────────────────────┘
```

### Step 5: Redeploy
```
┌────────────────────────────────┐
│  Latest Deployment             │
│  Status: Failed ❌             │
│                                │
│  [View Logs] [Redeploy] ← Click│
└────────────────────────────────┘
```

---

## 📁 CẤU TRÚC ĐÚNG:

### ❌ SAI - Railway build từ root:
```
Railway builds here ❌
    ↓
    /
    ├── server/
    │   ├── package.json  ← Không tìm thấy!
    │   └── Dockerfile.prod
    └── client/
        ├── package.json  ← Không tìm thấy!
        └── Dockerfile.prod
```

### ✅ ĐÚNG - Railway build từ subdirectory:
```
Server Service ✅
    Root Directory: /server
        ↓
        /server/
        ├── package.json  ← Tìm thấy! ✅
        └── Dockerfile.prod

Client Service ✅
    Root Directory: /client
        ↓
        /client/
        ├── package.json  ← Tìm thấy! ✅
        └── Dockerfile.prod
```

---

## 🎯 BUILD FLOW:

### ❌ Before (Lỗi):
```
Railway
  └─> Build from "/"
       └─> Run Dockerfile
            └─> COPY package*.json ./
                 └─> ❌ File not found!
```

### ✅ After (Thành công):
```
Railway
  └─> Build from "/server"  ← Root Directory set!
       └─> Run Dockerfile.prod
            └─> COPY package*.json ./
                 └─> ✅ Found package.json!
                      └─> RUN npm install
                           └─> ✅ Success!
```

---

## 📋 CHECKLIST:

### Server Service:
- [ ] Root Directory = `server`
- [ ] Dockerfile Path = `Dockerfile.prod`
- [ ] Port = `1337`
- [ ] Environment variables set ✅
- [ ] Connected to PostgreSQL ✅

### Client Service:
- [ ] Root Directory = `client`
- [ ] Dockerfile Path = `Dockerfile.prod`
- [ ] Port = `3000`
- [ ] Environment variables set ✅
- [ ] NEXT_PUBLIC_STRAPI_API_URL set ✅

---

## 🔄 DEPLOYMENT FLOW:

```
1. Push to GitHub
   ↓
2. Railway detects changes
   ↓
3. Build from correct Root Directory ✅
   ↓
4. Find package.json ✅
   ↓
5. Run npm install ✅
   ↓
6. Build application ✅
   ↓
7. Deploy! 🚀
```

---

## 🎨 RAILWAY DASHBOARD LAYOUT:

```
┌─────────────────────────────────────────────────┐
│ Railway Dashboard                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Project: Jewelry-Ecommerce                     │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │ 💾 Database │  │ 🖥️  Server  │  │ 🌐 Client│
│  │             │  │             │  │         │ │
│  │ PostgreSQL  │  │ Strapi      │  │ Next.js │ │
│  │             │  │             │  │         │ │
│  │ Running ✅  │  │ Failed ❌   │  │ N/A     │ │
│  └─────────────┘  └─────────────┘  └─────────┘│
│                        ↑                        │
│                        │                        │
│                   Fix This!                     │
│                   Settings →                    │
│                   Root Directory = "server"     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎬 ANIMATION (Mental Model):

### Before:
```
Railway: "Looking for package.json in /"
         ↓
         / (root)
         ├── 📄 README.md ✅
         ├── 📄 docker-compose.yml ✅
         ├── 📄 package.json ❌ NOT HERE!
         └── 📁 server/
             └── 📄 package.json (here but not found!)
```

### After:
```
Railway: "Looking for package.json in /server"
         ↓
         /server (root directory set!)
         ├── 📄 package.json ✅ FOUND!
         ├── 📄 Dockerfile.prod ✅
         └── 📁 node_modules/ (will create)
```

---

## 🎯 RESULT:

### Before Fix:
```
🔴 Build Failed
├─ Cannot find package.json
├─ npm install failed
└─ Deployment stopped ❌
```

### After Fix:
```
🟢 Build Successful
├─ ✅ Found package.json
├─ ✅ npm ci completed
├─ ✅ npm run build completed
├─ ✅ Application started
└─ ✅ Deployment successful! 🎉
```

---

## 📞 STILL STUCK?

### Quick Links:
- 📖 [FIX_RAILWAY_ERROR.md](./FIX_RAILWAY_ERROR.md) - Detailed fix
- 📚 [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md) - Full guide
- ⚡ [QUICK_START_RAILWAY.md](./QUICK_START_RAILWAY.md) - Quick ref

### Commands to try:
```bash
# Generate secrets
node generate-secrets.js

# Test locally
.\test-railway-build.ps1

# Check Railway status
railway status
```

---

## 💡 PRO TIPS:

1. **Always set Root Directory** khi deploy monorepo
2. **Test build locally** trước khi deploy
3. **Monitor logs** trong first deployment
4. **Use railway.json** để config permanent
5. **Keep docs updated** với team

---

**Chúc bạn deploy thành công! 🚀**

---

_Made with ❤️ for những bạn pull code về và bị lỗi 😊_
