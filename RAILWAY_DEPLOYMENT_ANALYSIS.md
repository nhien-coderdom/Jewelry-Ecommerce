# Railway Deployment - Phân Tích Lỗi và Giải Pháp

## 📊 Tình Trạng Hiện Tại

### ✅ Services Đã Deploy
- **Postgres Service**: ✅ Running (14 hours ago via CLI)
- **Jewelry-Ecommerce Backend**: ⚠️ Crashed/Failed
- **Vercel Frontend**: ✅ Deployed successfully
  - URL: https://jewelry-ecommerce-l2h6rgdwb-joppys-projects.vercel.app

---

## 🔴 Vấn Đề Chính

### 1. Backend Không Kết Nối Được Database
**Error**: `connect ECONNREFUSED 10.207.239.103:5432`

**Nguyên nhân**:
- Backend service chưa có DATABASE_URL đúng
- Đã set `DATABASE_URL=${{Postgres.DATABASE_URL}}` nhưng variable reference không work
- Railway CLI không resolve variable references như `${{...}}`

### 2. Postgres Database Trống Hoàn Toàn
**Hiện trạng**: "You have no tables"

**Nguyên nhân**:
- Railway Postgres là instance MỚI, chưa có schema
- Data từ local (105 entities, 40 images) chưa được migrate
- Strapi chưa chạy lần đầu để tạo schema

### 3. Environment Variables
**Đã set thành công** (qua Railway CLI):
```bash
✅ APP_KEYS
✅ API_TOKEN_SALT
✅ ADMIN_JWT_SECRET
✅ TRANSFER_TOKEN_SALT
✅ JWT_SECRET (có lỗi special characters)
✅ HOST, PORT, NODE_ENV
✅ CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET
✅ DATABASE_CLIENT=postgres
❌ DATABASE_URL (reference không work)
```

---

## 🎯 Giải Pháp Chi Tiết

### Bước 1: Fix DATABASE_URL
Railway Postgres cung cấp:
```
Host: postgres.railway.internal
Port: 5432
Database: railway
User: postgres
Password: WfgXDHlhNyvpYvAGylGFEogSvebDvTev
```

**DATABASE_URL cần set**:
```
postgresql://postgres:WfgXDHlhNyvpYvAGylGFEogSvebDvTev@postgres.railway.internal:5432/railway
```

**Lệnh CLI**:
```powershell
cd D:\Test\Jewelry-Ecommerce\server
railway link  # Chọn: Joppy's Projects → brave-analysis → production → Jewelry-Ecommerce

railway variables --set 'DATABASE_URL=postgresql://postgres:WfgXDHlhNyvpYvAGylGFEogSvebDvTev@postgres.railway.internal:5432/railway'
```

### Bước 2: Redeploy Backend
```powershell
railway up --detach
```

### Bước 3: Verify Deployment
```powershell
# Đợi 1-2 phút
Start-Sleep -Seconds 60

# Check logs
railway logs --lines 100

# Test API
curl https://jewelry-ecommerce-production.up.railway.app/api
```

### Bước 4: Import Data (Sau khi backend chạy thành công)

**Option A: Strapi Export/Import**
```powershell
# 1. Export từ local
cd D:\Test\Jewelry-Ecommerce\server
npm run strapi export -- --file ../railway-export.tar.gz

# 2. Import lên Railway (cần Railway CLI hoặc manual)
# Sẽ cần access vào Railway container để import
```

**Option B: PostgreSQL Dump/Restore**
```powershell
# 1. Export từ local database
docker exec jewelry-postgres pg_dump -U strapi jewelry_db > railway-import.sql

# 2. Import lên Railway Postgres (qua Railway CLI hoặc connection string)
# Cần Railway Postgres connection string public
```

---

## 📋 Checklist Deployment

### Backend (Railway)
- [x] Service created: Jewelry-Ecommerce
- [x] Postgres service linked
- [x] Environment variables set (APP_KEYS, JWT secrets, Cloudinary)
- [ ] DATABASE_URL set correctly (hardcoded connection string)
- [ ] Backend deployed successfully
- [ ] Strapi admin accessible
- [ ] Database schema created by Strapi
- [ ] Data imported from local

### Frontend (Vercel)
- [x] Deployed successfully
- [ ] Environment variables updated with Railway backend URL
- [ ] NEXT_PUBLIC_REST_API_URL = https://jewelry-ecommerce-production.up.railway.app/api
- [ ] RESEND_API_KEY added (optional)
- [ ] Redeployed after env vars update

### CORS Configuration
- [ ] Update `server/config/middlewares.js`
- [ ] Add Vercel URL to allowed origins
- [ ] Redeploy backend after CORS update

---

## 🐛 Các Lỗi Gặp Phải và Cách Fix

### 1. Railway CLI Keeps Selecting Wrong Service
**Vấn đề**: `railway link` luôn chọn Postgres thay vì Jewelry-Ecommerce

**Fix**: Unlink và link lại, chú ý chọn đúng service:
```powershell
railway unlink
railway link
# Chọn: Joppy's Projects → brave-analysis → production → Jewelry-Ecommerce (KHÔNG phải Postgres!)
```

### 2. Variable References Không Work
**Vấn đề**: `${{Postgres.DATABASE_URL}}` không được resolve

**Fix**: Dùng hardcoded connection string thay vì reference:
```powershell
railway variables --set 'DATABASE_URL=postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway'
```

### 3. Special Characters trong Environment Variables
**Vấn đề**: Characters như `%`, `#`, `!`, `$` bị PowerShell interpret

**Fix**: Wrap trong single quotes `'...'`
```powershell
railway variables --set 'JWT_SECRET=jP7%aL9#zT3vG1qH5k$X'
```

### 4. Empty Logs
**Vấn đề**: `railway logs` không show gì

**Fix**: 
- Deployment có thể đang build
- Vào Railway Dashboard → Deployments → Click deployment → View logs
- Hoặc đợi 1-2 phút rồi retry

---

## 🔧 Commands Tổng Hợp

### Setup Backend Service
```powershell
cd D:\Test\Jewelry-Ecommerce\server

# Link to backend service
railway link
# → Chọn: Jewelry-Ecommerce

# Set DATABASE_URL
railway variables --set 'DATABASE_URL=postgresql://postgres:WfgXDHlhNyvpYvAGylGFEogSvebDvTev@postgres.railway.internal:5432/railway'

# Deploy
railway up --detach

# Check status
Start-Sleep -Seconds 60
railway logs --lines 100
railway domain
```

### Check Service Status
```powershell
# Backend
railway status
railway logs --lines 50

# Test API
curl https://jewelry-ecommerce-production.up.railway.app/api

# Get domain
railway domain
```

### Switch Between Services
```powershell
# Unlink current
railway unlink

# Link to specific service
railway link
# Chọn service cần thiết (Postgres hoặc Jewelry-Ecommerce)

# Or use project/service flags (if available)
railway status --service Jewelry-Ecommerce
```

---

## 📝 Next Steps

1. **Ngay bây giờ**:
   - Fix DATABASE_URL với connection string hardcoded
   - Redeploy backend
   - Verify backend healthy

2. **Sau khi backend chạy**:
   - Strapi sẽ tự động tạo tables trong Railway Postgres
   - Import data từ local (105 entities)
   - Test admin panel: `https://jewelry-ecommerce-production.up.railway.app/admin`

3. **Update Vercel Frontend**:
   - Set `NEXT_PUBLIC_REST_API_URL` = Railway backend URL
   - Redeploy frontend

4. **Configure CORS**:
   - Add Vercel domain to backend CORS whitelist
   - Redeploy backend

5. **Test End-to-End**:
   - Frontend → Backend API
   - Authentication flow
   - Product listing
   - Cart functionality
   - Payment flow

---

## 🚀 Production URLs

- **Backend API**: https://jewelry-ecommerce-production.up.railway.app
- **Backend Admin**: https://jewelry-ecommerce-production.up.railway.app/admin
- **Frontend**: https://jewelry-ecommerce-l2h6rgdwb-joppys-projects.vercel.app
- **Database**: postgres.railway.internal:5432 (private)

---

## 📞 Railway Support Info

- **Project ID**: 060ab496-114e-451b-9768-16009b4a7071
- **Project Name**: brave-analysis
- **Environment**: production
- **Services**:
  - Postgres (ID: linked via reference)
  - Jewelry-Ecommerce (ID: c47d462c-d09d-4d84-96c2-d7a3833073e2)

---

## 💡 Lessons Learned

1. ❌ Railway CLI không support variable references `${{...}}` - phải dùng hardcoded values
2. ❌ PowerShell cần single quotes cho strings với special characters
3. ✅ Railway Postgres dùng `railway` làm default database name (không phải `postgres`)
4. ✅ Private network domain: `postgres.railway.internal` (không phải IP public)
5. ⚠️ Cần chờ 1-2 phút sau khi deploy để service start
6. ✅ Railway auto-generates `RAILWAY_*` environment variables
7. ⚠️ `railway link` dễ chọn nhầm service nếu không cẩn thận
