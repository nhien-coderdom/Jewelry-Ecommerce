# 👥 HƯỚNG DẪN CHO TEAM MEMBER MỚI

## 🎯 SETUP LẦN ĐẦU (One-time setup)

### Bước 1: Clone Repository
```powershell
# Clone project từ GitHub
git clone https://github.com/nhien-coderdom/Jewelry-Ecommerce.git

# Vào thư mục project
cd Jewelry-Ecommerce

# Checkout branch develop
git checkout feature/phase2
```

---

### Bước 2: Cài Docker Desktop

**Windows:**
1. Download: https://www.docker.com/products/docker-desktop/
2. Cài đặt Docker Desktop
3. Restart máy (nếu cần)
4. Mở Docker Desktop → Đợi status "Running" ✅

**Kiểm tra:**
```powershell
docker --version
# Output: Docker version 24.x.x
```

---

### Bước 3: Start Application

```powershell
# 1. Đảm bảo Docker Desktop đang chạy

# 2. Start tất cả services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# 3. Đợi ~30-60 giây để containers khởi động

# 4. Kiểm tra containers đang chạy
docker-compose ps

# Output mong đợi:
# jewelry-postgres   Up 8 hours (healthy)
# jewelry-server     Up 8 hours
# jewelry-client     Up 8 hours
```

---

### Bước 4: Truy cập Application

✅ **Frontend (Customer):**
```
http://localhost:3000
```

✅ **Backend Admin (Strapi):**
```
http://localhost:1337/admin
```

**Login admin:**
- Email: (hỏi team lead)
- Password: (hỏi team lead)

---

## 🔄 WORKFLOW HÀNG NGÀY

### 🌅 Buổi sáng - Bắt đầu làm việc:

```powershell
# 1. Pull code mới nhất
git pull origin feature/phase2

# 2. Mở Docker Desktop (nếu chưa mở)

# 3. Start containers
docker-compose up -d

# 4. Kiểm tra logs (nếu cần)
docker-compose logs -f

# 5. Truy cập: http://localhost:3000
```

---

### 💻 Coding:

```powershell
# Tùy thuộc công việc:

# Backend (Strapi):
# - Edit files trong: server/
# - API routes: server/src/api/
# - Database models: server/src/api/*/models/

# Frontend (Next.js):
# - Edit files trong: client/
# - Pages: client/app/
# - Components: client/app/_components/
```

**Hot reload tự động:**
- Save file → Container tự động restart
- Refresh browser để thấy thay đổi

---

### 💾 Commit code:

```powershell
# 1. Check thay đổi
git status

# 2. Add files
git add .

# 3. Commit với message rõ ràng
git commit -m "feat: add product filter feature"

# Hoặc:
# git commit -m "fix: resolve cart calculation bug"
# git commit -m "docs: update README"

# 4. Push lên GitHub
git push origin feature/phase2
```

**Commit message format:**
- `feat:` - Tính năng mới
- `fix:` - Sửa bug
- `docs:` - Cập nhật tài liệu
- `style:` - Format code
- `refactor:` - Cải thiện code
- `test:` - Thêm tests

---

### 🌙 Buổi tối - Kết thúc làm việc:

```powershell
# 1. Commit và push code
git add .
git commit -m "feat: today's work summary"
git push origin feature/phase2

# 2. Dừng containers (tiết kiệm RAM/CPU)
docker-compose down

# 3. Đóng Docker Desktop (optional)
```

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "Cannot connect to Docker daemon"
**Nguyên nhân:** Docker Desktop chưa chạy

**Giải pháp:**
```powershell
# 1. Mở Docker Desktop
# 2. Đợi status "Running"
# 3. Chạy lại: docker-compose up -d
```

---

### ❌ Lỗi: "Port 3000 already in use"
**Nguyên nhân:** Đã có app khác dùng port 3000

**Giải pháp:**
```powershell
# Option 1: Dừng app khác đang chạy

# Option 2: Kill process đang dùng port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Sau đó:
docker-compose up -d
```

---

### ❌ Lỗi: "Container exited with code 1"
**Nguyên nhân:** Container gặp lỗi khi start

**Giải pháp:**
```powershell
# 1. Xem logs để biết lỗi cụ thể
docker-compose logs server
# Hoặc:
docker-compose logs client

# 2. Rebuild container
docker-compose down
docker-compose up -d --build
```

---

### ❌ Database không có data
**Nguyên nhân:** Lần đầu setup, database trống

**Giải pháp:**
1. Hỏi team lead để lấy database dump file
2. Hoặc tự tạo data test trong Strapi Admin

---

### ❌ Code thay đổi nhưng không thấy update
**Giải pháp:**
```powershell
# 1. Restart container
docker-compose restart server
# Hoặc:
docker-compose restart client

# 2. Hard refresh browser: Ctrl + Shift + R

# 3. Rebuild nếu vẫn không được
docker-compose up -d --build
```

---

## 📁 CẤU TRÚC PROJECT

```
Jewelry-Ecommerce/
├── client/                    # Frontend (Next.js)
│   ├── app/                   # Pages & Routes
│   │   ├── page.js            # Homepage
│   │   ├── products/          # Products pages
│   │   ├── cart/              # Cart page
│   │   └── _components/       # Shared components
│   ├── public/                # Static files
│   └── package.json
│
├── server/                    # Backend (Strapi)
│   ├── src/
│   │   ├── api/               # API routes
│   │   │   ├── product/       # Product API
│   │   │   ├── category/      # Category API
│   │   │   └── cart/          # Cart API
│   │   └── index.js
│   ├── config/                # Configuration
│   ├── database/              # Database config
│   └── package.json
│
├── docker-compose.yml         # Docker setup
├── README_COMPLETE.md         # Tài liệu tổng hợp
├── TEAM_DOCKER_GUIDE.md       # Hướng dẫn Docker
└── TEAM_SETUP_GUIDE.md        # File này
```

---

## 🌐 URLS QUAN TRỌNG

### Local (Development):
```
Frontend:  http://localhost:3000
Backend:   http://localhost:1337
Admin:     http://localhost:1337/admin
Database:  localhost:5432 (PostgreSQL)
```

### Production:
```
Backend:   https://jewelry-ecommerce-l2ju.onrender.com
Admin:     https://jewelry-ecommerce-l2ju.onrender.com/admin
Frontend:  https://jewelry-ecommerce-xxx.vercel.app (check Vercel)
```

---

## 📚 TÀI LIỆU THAM KHẢO

| File | Nội dung |
|------|----------|
| `README_COMPLETE.md` | Tài liệu tổng quan toàn bộ hệ thống |
| `TEAM_DOCKER_GUIDE.md` | Hướng dẫn Docker chi tiết |
| `DEPLOYMENT_WORKFLOW.md` | Quy trình deploy production |
| `TEAM_SETUP_GUIDE.md` | File này - Setup cho team |

---

## 💬 HỎI AI KHI GẶP VẤN ĐỀ?

1. **Check tài liệu trước:** Đọc các file .md trong project
2. **Check logs:** `docker-compose logs -f`
3. **Google error message**
4. **Hỏi team lead hoặc dev khác**
5. **Tạo issue trên GitHub** (cho bug lớn)

---

## ✅ CHECKLIST LẦN ĐẦU

```
☐ Clone repository từ GitHub
☐ Cài Docker Desktop
☐ docker-compose up -d
☐ Truy cập http://localhost:3000 thành công
☐ Truy cập http://localhost:1337/admin thành công
☐ Tạo test commit và push lên GitHub
☐ Đọc README_COMPLETE.md
☐ Join team chat/Slack/Discord
```

---

## 🎉 WELCOME TO THE TEAM!

Có câu hỏi gì cứ hỏi! Happy coding! 🚀

---

## 📞 CONTACTS

- **Team Lead:** [Tên + Email]
- **GitHub Repo:** https://github.com/nhien-coderdom/Jewelry-Ecommerce
- **Slack/Discord:** [Link]
- **Documentation:** https://github.com/nhien-coderdom/Jewelry-Ecommerce#readme
