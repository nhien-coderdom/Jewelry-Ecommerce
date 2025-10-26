#  - CHẠY DOCKER

## 📋 TRƯỚC KHI BẮT ĐẦU

✅ **Đã cài Docker Desktop** trên máy Windows  
✅ **Đã clone project** về máy  
✅ **Đã có PowerShell** (có sẵn trong Windows)

---

## 🔥 CÁCH CHẠY ỨNG DỤNG - CHỈ 4 BƯỚC!

### BƯỚC 1: MỞ DOCKER DESKTOP 🐳

1. **Nhấn phím `Windows + S`**
2. **Gõ:** `Docker Desktop`  
3. **Click vào Docker Desktop** để mở
4. **Chờ Docker khởi động** cho đến khi thấy:
   ```
   ✅ Docker Desktop is running
   ```
   
   **Hoặc** tìm icon Docker (con cá voi 🐳) ở góc phải màn hình (system tray)

---

### BƯỚC 2: MỞ POWERSHELL VÀ VÀO THƯ MỤC PROJECT 📁

1. **Nhấn `Windows + R`**
2. **Gõ:** `powershell` → **Enter**
3. **Di chuyển vào thư mục project:**
   ```powershell
   cd D:\Test\Jewelry-Ecommerce
   ```
   *(Thay đổi đường dẫn nếu project ở vị trí khác)*

---

### BƯỚC 3: CHẠY LỆNH DOCKER 🚀

**Copy và paste lệnh này:**
```powershell
docker-compose up -d
```

**Bạn sẽ thấy:**
```
✅ Container jewelry-server   Started
✅ Container jewelry-client   Started  
```

**Chờ khoảng 30-60 giây** để containers khởi động hoàn toàn.

---

### BƯỚC 4: KIỂM TRA KẾT QUẢ 🎯

**Mở trình duyệt và truy cập:**

1. **Frontend (khách hàng):** http://localhost:3000
2. **Strapi Admin (quản lý):** http://localhost:1337/admin

**Nếu thấy website hiện lên → THÀNH CÔNG! 🎉**

---

## 🔍 KIỂM TRA CONTAINERS ĐANG CHẠY

```powershell
# Xem containers đang hoạt động
docker-compose ps

# Nếu thành công sẽ thấy:
# jewelry-server    Up
# jewelry-client    Up
```

---

## 🛑 CÁCH DỪNG ỨNG DỤNG

```powershell
# Dừng tất cả containers
docker-compose down
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Docker command not found"
**Nguyên nhân:** Docker Desktop chưa chạy  
**Giải pháp:** Làm lại **BƯỚC 1** - mở Docker Desktop

### ❌ Lỗi: "Cannot find the file specified"  
**Nguyên nhân:** Docker Desktop service chưa ready  
**Giải pháp:**
```powershell
# Restart Docker Desktop:
# 1. Right-click icon Docker → Quit Docker Desktop
# 2. Mở lại Docker Desktop  
# 3. Chờ "Docker Desktop is running"
# 4. Chạy lại: docker-compose up -d
```

### ❌ Lỗi: "Port already in use"
**Nguyên nhân:** Có ứng dụng khác đang dùng port 3000 hoặc 1337  
**Giải pháp:**
```powershell
# Dừng containers cũ
docker-compose down

# Chạy lại
docker-compose up -d
```

### ❌ Website không hiện gì
**Giải pháp:**
```powershell
# Xem logs để debug
docker-compose logs -f

# Hoặc restart containers
docker-compose restart
```

---

## 📝 WORKFLOW HÀNG NGÀY

### Khi bắt đầu làm việc:
```powershell
# 1. Mở Docker Desktop (nếu chưa mở)
# 2. Vào thư mục project
cd D:\Test\Jewelry-Ecommerce

# 3. Start containers
docker-compose up -d

# 4. Mở browser: http://localhost:3000
```

### Khi kết thúc làm việc:
```powershell
# Dừng containers (tiết kiệm tài nguyên)
docker-compose down
```

### Khi có code mới từ Git:
```powershell
# Pull code mới
git pull

# Rebuild containers với code mới
docker-compose up -d --build
```

---

## 🎯 TÓM TẮT NHANH

```powershell
# 1. Mở Docker Desktop ✅
# 2. Mở PowerShell, vào thư mục project
cd D:\Test\Jewelry-Ecommerce

# 3. Chạy containers
docker-compose up -d

# 4. Truy cập: http://localhost:3000 🚀
```

---

