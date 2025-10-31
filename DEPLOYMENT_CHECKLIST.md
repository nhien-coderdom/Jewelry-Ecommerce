# 🚀 Railway Deployment Checklist

## Phase 1: Chuẩn bị (Preparation)

### Code & Config
- [ ] Code đã được test kỹ trên local
- [ ] Tất cả dependencies đã được install
- [ ] `.env.example` đã cập nhật đầy đủ
- [ ] Dockerfile.prod cho server và client đã sẵn sàng
- [ ] .dockerignore đã được config đúng
- [ ] CORS settings đã được config trong `server/config/middlewares.js`

### Secrets Generation
- [ ] Chạy `node generate-secrets.js` để tạo secrets mới
- [ ] Lưu secrets vào file an toàn (1Password, LastPass, etc.)
- [ ] ⚠️ **KHÔNG commit secrets vào Git**

### Git Repository
- [ ] Code đã được push lên GitHub
- [ ] Branch `main` hoặc `feature/phase2` đã sẵn sàng
- [ ] .gitignore đã được config đúng (không commit .env, node_modules)

---

## Phase 2: Railway Setup

### Account & Project
- [ ] Đã có tài khoản Railway (https://railway.app)
- [ ] Đã link GitHub account với Railway
- [ ] Tạo new project trên Railway
- [ ] Connect project với GitHub repository

### Database Setup
- [ ] Add PostgreSQL database to project
- [ ] Database đã khởi động thành công
- [ ] Ghi lại database connection info

---

## Phase 3: Deploy Server (Strapi)

### Service Configuration
- [ ] Create new service từ GitHub repo
- [ ] **Root Directory** = `server` ✅
- [ ] **Dockerfile Path** = `Dockerfile.prod` ✅
- [ ] Branch = `main` hoặc `feature/phase2`

### Environment Variables - Server
Copy từ `.env.railway.example`:

**Database:**
- [ ] `DATABASE_CLIENT=postgres`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `DATABASE_HOST=${{Postgres.PGHOST}}`
- [ ] `DATABASE_PORT=${{Postgres.PGPORT}}`
- [ ] `DATABASE_NAME=${{Postgres.PGDATABASE}}`
- [ ] `DATABASE_USERNAME=${{Postgres.PGUSER}}`
- [ ] `DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}`
- [ ] `DATABASE_SSL=false`
- [ ] `DATABASE_SCHEMA=public`

**Strapi Secrets:**
- [ ] `APP_KEYS=<generated-keys>`
- [ ] `API_TOKEN_SALT=<generated-salt>`
- [ ] `ADMIN_JWT_SECRET=<generated-secret>`
- [ ] `TRANSFER_TOKEN_SALT=<generated-salt>`
- [ ] `JWT_SECRET=<generated-secret>`

**Server Config:**
- [ ] `HOST=0.0.0.0`
- [ ] `PORT=1337`
- [ ] `NODE_ENV=production`

**Cloudinary (File Upload):**
- [ ] `CLOUDINARY_NAME=<your-name>`
- [ ] `CLOUDINARY_KEY=<your-key>`
- [ ] `CLOUDINARY_SECRET=<your-secret>`

### Deploy Server
- [ ] Click "Deploy"
- [ ] Theo dõi build logs
- [ ] Build thành công ✅
- [ ] Service đã start
- [ ] Ghi lại **Server URL**: `https://________.railway.app`

### Test Server
- [ ] Truy cập: `https://[server-url]/admin`
- [ ] Tạo admin account đầu tiên
- [ ] Login thành công
- [ ] Check database connection
- [ ] Test API endpoints: `https://[server-url]/api/products`

---

## Phase 4: Deploy Client (Next.js)

### Service Configuration
- [ ] Create new service từ GitHub repo
- [ ] **Root Directory** = `client` ✅
- [ ] **Dockerfile Path** = `Dockerfile.prod` ✅
- [ ] Branch = `main` hoặc `feature/phase2`

### Environment Variables - Client

**API URLs:**
- [ ] `NEXT_PUBLIC_STRAPI_API_URL=https://[server-url]/api`
- [ ] `NEXT_PUBLIC_STRAPI_URL=https://[server-url]`

**Stripe:**
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-key>`
- [ ] `STRIPE_SECRET_KEY=<your-secret>`

**Clerk (Auth):**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-key>`
- [ ] `CLERK_SECRET_KEY=<your-secret>`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`

**Resend (Email):**
- [ ] `RESEND_API_KEY=<your-key>`

**Next.js Config:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`

### Deploy Client
- [ ] Click "Deploy"
- [ ] Theo dõi build logs
- [ ] Build thành công ✅
- [ ] Service đã start
- [ ] Ghi lại **Client URL**: `https://________.railway.app`

### Test Client
- [ ] Truy cập: `https://[client-url]`
- [ ] Homepage load thành công
- [ ] Products page hiển thị sản phẩm
- [ ] Test navigation
- [ ] Check console không có errors

---

## Phase 5: Update CORS & URLs

### Update Server Environment
- [ ] Update `CLIENT_URL=https://[client-url]`
- [ ] Redeploy server

### Update CORS in Code (Optional - nếu cần)
File: `server/config/middlewares.js`
```javascript
origin: [
  'https://[your-actual-client-url].railway.app',
  'http://localhost:3000' // for local dev
]
```
- [ ] Commit và push nếu có thay đổi

---

## Phase 6: Integration Testing

### Authentication
- [ ] Sign up flow hoạt động
- [ ] Sign in flow hoạt động
- [ ] Sign out flow hoạt động
- [ ] Protected routes hoạt động đúng

### Products & Cart
- [ ] Browse products
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Remove from cart

### Checkout & Payment
- [ ] Checkout process
- [ ] Stripe payment form
- [ ] Test payment (use test card: 4242 4242 4242 4242)
- [ ] Payment confirmation page
- [ ] Email notification (nếu có)

### Admin Panel
- [ ] Login to Strapi admin
- [ ] Create/Edit products
- [ ] Upload images
- [ ] Manage orders
- [ ] Check database records

---

## Phase 7: Monitoring & Optimization

### Health Checks
- [ ] Server health endpoint: `https://[server-url]/_health`
- [ ] Monitor Railway metrics (CPU, Memory, Network)
- [ ] Check logs for errors

### Performance
- [ ] Page load times acceptable
- [ ] Image optimization working
- [ ] API response times good

### Security
- [ ] HTTPS enabled (Railway default)
- [ ] CORS properly configured
- [ ] No secrets exposed in client code
- [ ] Environment variables secure

---

## Phase 8: Documentation & Handoff

### Update Documentation
- [ ] Update README.md with production URLs
- [ ] Document any special deployment notes
- [ ] Create runbook for common issues

### Team Handoff
- [ ] Share Railway project access
- [ ] Share environment variables securely
- [ ] Document maintenance procedures
- [ ] Setup monitoring alerts

---

## 🆘 Troubleshooting

### Build Failed
- [ ] Check build logs in Railway
- [ ] Verify Root Directory setting
- [ ] Verify Dockerfile.prod exists
- [ ] Test build locally first

### Server Won't Start
- [ ] Check runtime logs
- [ ] Verify all env vars set
- [ ] Check database connection
- [ ] Verify PORT is 1337

### Client Won't Connect to Server
- [ ] Verify NEXT_PUBLIC_STRAPI_API_URL
- [ ] Check CORS settings
- [ ] Test API endpoint directly
- [ ] Check network tab in browser

### Database Issues
- [ ] Verify DATABASE_URL is set
- [ ] Check database is running
- [ ] Test connection from server logs
- [ ] Check migrations ran successfully

---

## 📋 Quick Reference

### Railway Commands
```bash
railway login
railway link
railway logs --service=server
railway logs --service=client
railway run <command>
```

### Service URLs
- Server: `https://________.railway.app`
- Client: `https://________.railway.app`
- Admin: `https://[server-url]/admin`
- API: `https://[server-url]/api`

### Support Resources
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project: [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)

---

**Status**: 🟡 In Progress / 🟢 Completed / 🔴 Blocked

**Last Updated**: _____________

**Deployed By**: _____________

**Notes**: 
```
Add any important notes or custom configurations here
```
