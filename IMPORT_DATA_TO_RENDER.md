# 📊 IMPORT DỮ LIỆU TỪ LOCAL LÊN RENDER

## ❓ VẤN ĐỀ

- ✅ **Local database**: Có đầy đủ data (105 entities)
- ❌ **Render database**: Trống (vừa tạo mới)

**Nguyên nhân:** Local và Production là 2 database **HOÀN TOÀN RIÊNG BIỆT**

---

## ✅ GIẢI PHÁP - 3 CÁCH

### **CÁCH 1: Import qua pgAdmin (Đơn giản nhất - Recommend)**

#### Bước 1: Export Local Database
```powershell
# Export database từ Docker
docker exec jewelry-postgres pg_dump -U strapi -d jewelry_db -F c -f /tmp/render_export.dump

# Copy ra host
docker cp jewelry-postgres:/tmp/render_export.dump ./render_export.dump
```

#### Bước 2: Cài pgAdmin
1. Download: https://www.pgadmin.org/download/pgadmin-4-windows/
2. Cài đặt pgAdmin 4

#### Bước 3: Connect đến Render Database
1. Mở pgAdmin
2. Right-click **Servers** → **Register** → **Server**
3. **General Tab:**
   - Name: `Render Jewelry DB`
4. **Connection Tab:**
   - Host: `dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `jewelry_db_4n4f`
   - Username: `strapi`
   - Password: `PmmhIUXVEoKDJV7asLPawkS7vEU8Unto`
5. **SSL Tab:**
   - SSL Mode: `Require`
6. Click **Save**

#### Bước 4: Import Data
1. Right-click database `jewelry_db_4n4f` → **Restore**
2. **Format:** Custom or tar
3. **Filename:** Browse → Chọn `render_export.dump`
4. **Options:**
   - ✅ Clean before restore
   - ✅ Do not save: Owner
   - ✅ Do not save: Privileges
5. Click **Restore**

⏱️ **Thời gian:** 1-2 phút

---

### **CÁCH 2: Command Line (Nhanh nhất)**

#### Bước 1: Cài PostgreSQL Client
```powershell
# Cài qua winget
winget install PostgreSQL.PostgreSQL

# Hoặc download: https://www.postgresql.org/download/windows/
```

#### Bước 2: Export Local
```powershell
# Export
docker exec jewelry-postgres pg_dump -U strapi -d jewelry_db -F c -f /tmp/render_export.dump

# Copy ra host
docker cp jewelry-postgres:/tmp/render_export.dump ./render_export.dump
```

#### Bước 3: Import lên Render
```powershell
# Set password (để không nhập lại)
$env:PGPASSWORD = "PmmhIUXVEoKDJV7asLPawkS7vEU8Unto"

# Import
pg_restore --verbose --clean --no-acl --no-owner `
  -h dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com `
  -U strapi -d jewelry_db_4n4f render_export.dump
```

⏱️ **Thời gian:** 30 giây - 1 phút

---

### **CÁCH 3: Chạy script tự động (Fastest)**

#### Chạy script có sẵn:
```powershell
# Export từ Local
.\export-to-render.ps1

# Sau đó làm theo hướng dẫn để import
```

---

## 🔒 THÔNG TIN RENDER DATABASE

```
Host:     dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com
Port:     5432
Database: jewelry_db_4n4f
Username: strapi
Password: PmmhIUXVEoKDJV7asLPawkS7vEU8Unto
SSL:      Required
```

**Connection String:**
```
postgresql://strapi:PmmhIUXVEoKDJV7asLPawkS7vEU8Unto@dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com/jewelry_db_4n4f?sslmode=require
```

---

## ⚠️ LƯU Ý

1. **Backup trước khi import:**
   - Render database hiện đang trống nên không cần backup
   - Nếu có data quan trọng, backup trước!

2. **SSL Required:**
   - Render **BẮT BUỘC** SSL connection
   - Thêm `?sslmode=require` vào connection string

3. **Schema conflicts:**
   - Nếu lỗi "schema already exists", thêm `--clean` flag
   - Command đã có `--clean` để tự động xóa cũ trước khi import

4. **Performance:**
   - Import 105 entities + 40 images: ~1-2 phút
   - Render free tier có bandwidth limit

---

## ✅ SAU KHI IMPORT XONG

### Kiểm tra Production:
```
1. Truy cập: https://jewelry-ecommerce-l2ju.onrender.com/admin
2. Login với account admin
3. Check Content Manager → Xem các collections
4. Test API: https://jewelry-ecommerce-l2ju.onrender.com/api/products
```

### Nếu thành công:
- ✅ Thấy đầy đủ Products, Categories, Banners
- ✅ API trả về data
- ✅ Frontend hiển thị sản phẩm

---

## 🚨 TROUBLESHOOTING

### Lỗi: "password authentication failed"
```powershell
# Check password đúng chưa
$env:PGPASSWORD = "PmmhIUXVEoKDJV7asLPawkS7vEU8Unto"
```

### Lỗi: "could not connect to server"
```powershell
# Check SSL mode
# Thêm: --set ON_ERROR_STOP=off
```

### Lỗi: "permission denied"
```powershell
# Dùng --no-owner --no-acl (đã có trong command)
```

### Lỗi: "relation already exists"
```powershell
# Dùng --clean flag (đã có trong command)
```

---

## 📝 SCRIPT TỰ ĐỘNG (PowerShell)

```powershell
# export-to-render.ps1

# Export từ local
docker exec jewelry-postgres pg_dump -U strapi -d jewelry_db -F c -f /tmp/render_export.dump
docker cp jewelry-postgres:/tmp/render_export.dump ./render_export.dump

# Import lên Render
$env:PGPASSWORD = "PmmhIUXVEoKDJV7asLPawkS7vEU8Unto"
pg_restore --verbose --clean --no-acl --no-owner `
  -h dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com `
  -U strapi -d jewelry_db_4n4f render_export.dump

Write-Host "✅ Import complete!" -ForegroundColor Green
```

---

## 🎯 TÓM TẮT

| Cách | Độ khó | Thời gian | Recommend |
|------|--------|-----------|-----------|
| pgAdmin (GUI) | ⭐ Easy | 3-5 phút | ✅ Nếu chưa quen command line |
| Command Line | ⭐⭐ Medium | 1-2 phút | ✅ Nếu quen terminal |
| Script tự động | ⭐ Easy | 30 giây | ✅✅ Fastest |

**Khuyến nghị:** Dùng **pgAdmin** nếu lần đầu, hoặc **Command Line** nếu muốn nhanh.

---

🎉 **Sau khi import xong, Production sẽ có đầy đủ data như Local!**
