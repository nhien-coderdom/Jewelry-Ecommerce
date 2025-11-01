# Railway Deployment Guide

## 🚀 Hướng dẫn deploy lên Railway

### 1. Chuẩn bị

#### A. Tạo tài khoản Railway
- Truy cập: https://railway.app
- Đăng nhập bằng GitHub account

### 2. Deploy Backend (Strapi Server)

#### A. Tạo Project mới
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository: `Jewelry-Ecommerce`

#### B. Cấu hình Server Service
1. Click "Add Service" → "GitHub Repo"
2. Chọn branch: `main` hoặc `feature/phase2`
3. **Root Directory**: `/server`
4. **Dockerfile Path**: `Dockerfile.prod`

#### C. Thêm Database PostgreSQL
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway sẽ tự động tạo database và cấp connection string

#### D. Cấu hình Environment Variables cho Server
```env
# Database
DATABASE_CLIENT=postgres
DATABASE_URL=${PGDATABASE}  # Railway tự động inject
DATABASE_HOST=${PGHOST}
DATABASE_PORT=${PGPORT}
DATABASE_NAME=${PGDATABASE}
DATABASE_USERNAME=${PGUSER}
DATABASE_PASSWORD=${PGPASSWORD}
DATABASE_SSL=false
DATABASE_SCHEMA=public

# Strapi
APP_KEYS=tobemodified123456789,tobemodified123456789,tobemodified123456789,tobemodified123456789
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified

# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Upload
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret

# Client URL (sẽ update sau khi deploy client)
CLIENT_URL=https://your-client-url.railway.app
```

**⚠️ LƯU Ý QUAN TRỌNG:**
- Tạo APP_KEYS mới bằng cách chạy:
  ```bash
  node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
  ```
  Chạy 4 lần và nối bằng dấu phẩy

- Tạo các secret khác:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

#### E. Deploy Settings
1. **Build Command**: Tự động (sử dụng Dockerfile)
2. **Start Command**: `npm start`
3. **Health Check Path**: `/_health`

### 3. Deploy Frontend (Next.js Client)

#### A. Tạo Service mới trong cùng Project
1. Click "New Service" → "GitHub Repo"
2. Chọn cùng repository
3. **Root Directory**: `/client`
4. **Dockerfile Path**: `Dockerfile.prod`

#### B. Cấu hình Environment Variables cho Client
```env
# API
NEXT_PUBLIC_STRAPI_API_URL=https://your-server-url.railway.app/api
NEXT_PUBLIC_STRAPI_URL=https://your-server-url.railway.app

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Other
NODE_ENV=production
PORT=3000
```

#### C. Deploy Settings
1. **Build Command**: Tự động (sử dụng Dockerfile)
2. **Start Command**: `npm start`

### 4. Cập nhật CORS và URLs

#### A. Update Server Environment Variables
Sau khi có URL của client, update lại:
```env
CLIENT_URL=https://your-actual-client-url.railway.app
```

#### B. Update Strapi CORS Settings
File: `server/config/middlewares.js`
```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'https://your-client-url.railway.app',
        'http://localhost:3000'
      ],
      credentials: true,
    },
  },
  // ... other middlewares
];
```

### 5. Railway CLI (Optional)

Nếu muốn deploy từ terminal:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# Xem logs
railway logs

# Mở service
railway open
```

### 6. Automatic Deployments

Railway tự động deploy khi:
- Push code lên branch đã config (main hoặc feature/phase2)
- Merge pull request
- Tạo new release

### 7. Monitoring & Logs

1. **View Logs**: 
   - Vào Railway dashboard
   - Click vào service
   - Tab "Deployments" → Click vào deployment → "View Logs"

2. **Metrics**:
   - Tab "Metrics" để xem CPU, Memory, Network usage

3. **Health Checks**:
   - Railway tự động restart service nếu health check fail

### 8. Database Management

#### Backup Database
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

#### Restore Database
```bash
railway run psql $DATABASE_URL < backup.sql
```

#### Connect to Database
```bash
railway connect postgres
```

### 9. Troubleshooting

#### Lỗi Build Failed
- Kiểm tra logs trong Railway dashboard
- Verify Dockerfile đúng
- Kiểm tra package.json có đầy đủ dependencies

#### Lỗi Connection Timeout
- Kiểm tra DATABASE_URL
- Verify PostgreSQL service đang chạy
- Check security group settings

#### Lỗi 502 Bad Gateway
- Service có thể đang restart
- Check logs để xem lỗi cụ thể
- Verify PORT environment variable

#### Out of Memory
- Upgrade plan hoặc tối ưu code
- Kiểm tra memory leaks
- Reduce build cache

### 10. Cost Optimization

- **Hobby Plan**: $5/month per service
- **Shared Database**: Included
- **Tips**: 
  - Sử dụng shared database cho development
  - Enable auto-sleep cho dev environments
  - Monitor usage trong dashboard

### 11. Security Best Practices

✅ **Checklist:**
- [ ] Thay đổi tất cả default secrets
- [ ] Enable HTTPS (Railway tự động)
- [ ] Configure CORS đúng
- [ ] Không commit secrets vào Git
- [ ] Sử dụng environment variables
- [ ] Enable rate limiting
- [ ] Regular security updates

### 12. GitHub Actions Integration

File `.github/workflows/deploy.yml` đã được tạo sẵn để:
- Chạy tests trước khi deploy
- Build và verify code
- Tự động deploy khi pass tests

---

## 📝 Checklist Deploy

### Trước khi deploy:
- [ ] Code đã được test kỹ
- [ ] Environment variables đã chuẩn bị
- [ ] Database migration scripts sẵn sàng
- [ ] CORS settings đã cấu hình
- [ ] Cloudinary/Stripe keys đã có

### Sau khi deploy:
- [ ] Verify cả 2 services đang chạy
- [ ] Test API endpoints
- [ ] Test frontend pages
- [ ] Check database connection
- [ ] Verify file uploads
- [ ] Test payment flow
- [ ] Monitor logs 24h đầu

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check Railway status: https://railway.app/status
2. Railway Discord: https://discord.gg/railway
3. Documentation: https://docs.railway.app

---

**Created for Jewelry E-commerce Project**
