# 🔄 Script Migration: SQLite → PostgreSQL

## Bước 1: Export data từ SQLite

```powershell
# 1. Tạm chuyển về SQLite
Write-Host "Step 1: Switching back to SQLite temporarily..." -ForegroundColor Yellow

# Backup .env hiện tại
Copy-Item ".\server\.env" ".\server\.env.postgres.backup"

# Tạo .env với SQLite config
@"
HOST=0.0.0.0
PORT=1337

# Strapi Secrets
APP_KEYS="L6h%8kdP0!aXz2#,Bq3^9zTf@4eR!,V1rU0m$`$gE&yN7oP"
API_TOKEN_SALT=G2f#7k9L!qWeR4tZ8
ADMIN_JWT_SECRET=x9Y!vE2r$`$Lp0Qw3zR7d@K
TRANSFER_TOKEN_SALT=h6Jq2!sRz9$`$gWm8nT
JWT_SECRET=jP7%aL9#zT3vG1qH5k$`$X

# Cloudinary
CLOUDINARY_NAME="dlbrgqhhg"
CLOUDINARY_KEY="913721861557326"
CLOUDINARY_SECRET="vDBTqzrw2XAjSJiDupextBbqm78"

# SQLite (temporary for export)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=data.db
"@ | Out-File -FilePath ".\server\.env" -Encoding UTF8

# 2. Export data
Write-Host "Step 2: Exporting data from SQLite..." -ForegroundColor Yellow
Set-Location ".\server"
npm run strapi export -- --file ../sqlite-backup --no-encrypt
Set-Location ".."

Write-Host "✅ SQLite data exported to: sqlite-backup.tar.gz" -ForegroundColor Green

## Bước 2: Restore .env PostgreSQL và import data

Write-Host "`nStep 3: Switching back to PostgreSQL..." -ForegroundColor Yellow
Move-Item ".\server\.env.postgres.backup" ".\server\.env" -Force

Write-Host "Step 4: Starting PostgreSQL and Strapi..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 10

docker-compose up -d server
Write-Host "Waiting for Strapi to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nStep 5: Importing data to PostgreSQL..." -ForegroundColor Yellow
docker-compose exec -T server npm run strapi import -- --file /app/../sqlite-backup.tar.gz

Write-Host "`n✅ Migration completed!" -ForegroundColor Green
Write-Host "Check: http://localhost:1337/admin" -ForegroundColor Cyan
```

Lưu script này vào file `migrate-sqlite-to-postgres.ps1` và chạy:

```powershell
.\migrate-sqlite-to-postgres.ps1
```

Hoặc làm manual từng bước:

## Manual Migration Steps:

### 1. Stop containers hiện tại
```powershell
docker-compose down
```

### 2. Tạm chuyển về SQLite để export
```powershell
# Trong server/.env, đổi lại thành:
# DATABASE_CLIENT=sqlite
# DATABASE_FILENAME=data.db
```

### 3. Export data
```powershell
cd server
npm run strapi export -- --file ../backup --no-encrypt
cd ..
```

### 4. Chuyển lại PostgreSQL
```powershell
# Restore server/.env với PostgreSQL config
```

### 5. Start PostgreSQL và Strapi
```powershell
docker-compose up -d
# Đợi 30 giây cho Strapi khởi động
```

### 6. Import data
```powershell
docker-compose exec server npm run strapi import -- --file ../backup.tar.gz
```

Bạn muốn tôi tạo script tự động này không?
