# 🔄 Migration Guide: SQLite → PostgreSQL

## ⚠️ Quan trọng

Bạn đã có data trong SQLite (`server/data.db`)? Cần migrate sang PostgreSQL!

## 🚀 Quick Start (Không có data cũ)

Nếu bạn **KHÔNG cần giữ data cũ**, chỉ cần:

```powershell
# 1. Stop containers cũ
docker-compose down -v

# 2. Start lại với PostgreSQL
docker-compose up --build
```

✅ Xong! Strapi sẽ tự động tạo tables mới trong PostgreSQL.

---

## 📦 Migration (Có data cũ cần giữ)

### Bước 1: Backup data từ SQLite

```powershell
# Vào server container (nếu đang chạy)
docker-compose exec server npm run strapi export -- --file backup

# Hoặc chạy local
cd server
npm run strapi export -- --file backup.tar.gz
```

### Bước 2: Chuyển sang PostgreSQL

```powershell
# Stop và xóa containers cũ
docker-compose down -v

# Start PostgreSQL
docker-compose up postgres -d

# Đợi PostgreSQL khởi động (10-15 giây)
Start-Sleep -Seconds 15

# Start Strapi với PostgreSQL
docker-compose up server -d
```

### Bước 3: Import data vào PostgreSQL

```powershell
# Đợi Strapi khởi động xong
Start-Sleep -Seconds 20

# Import data
docker-compose exec server npm run strapi import -- --file backup.tar.gz
```

---

## 🔍 Verify Migration

```powershell
# Check logs
docker-compose logs server

# Check database
docker-compose exec postgres psql -U strapi -d jewelry_db -c "\dt"

# Test API
curl http://localhost:1337/api/products
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```powershell
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
docker-compose restart server
```

### "Migration failed"
```powershell
# Reset và start lại
docker-compose down -v
docker-compose up --build
```

### "Data không hiện"
- Check Strapi admin: http://localhost:1337/admin
- Verify PostgreSQL có data: `docker-compose exec postgres psql -U strapi -d jewelry_db -c "SELECT * FROM products LIMIT 5;"`

---

## 📊 So sánh SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Performance** | Tốt cho dev | Tốt cho production |
| **Concurrent writes** | Limited | Excellent |
| **Data size** | < 1GB | Unlimited |
| **Railway support** | ❌ | ✅ |
| **Production ready** | ❌ | ✅ |

---

## 💡 Tips

- ✅ PostgreSQL tốt hơn cho production
- ✅ Hỗ trợ concurrent users
- ✅ Railway có PostgreSQL miễn phí
- ✅ Backup dễ dàng hơn

---

## 🔙 Rollback (Về lại SQLite)

Nếu muốn quay lại SQLite:

1. Restore file `docker-compose.yml` cũ
2. Restore `server/.env` cũ
3. Chạy: `docker-compose down -v && docker-compose up`

---

**Đã chuyển xong! 🎉**
