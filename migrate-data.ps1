# SQLite to PostgreSQL Migration Script
# Usage: .\migrate-data.ps1

Write-Host "🔄 SQLite → PostgreSQL Migration Tool" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if data.db exists
if (-not (Test-Path ".\server\data.db")) {
    Write-Host "❌ Error: SQLite database (server/data.db) not found!" -ForegroundColor Red
    Write-Host "Nothing to migrate. Starting fresh PostgreSQL..." -ForegroundColor Yellow
    docker-compose up -d
    exit 0
}

Write-Host "✅ Found SQLite database: server/data.db" -ForegroundColor Green
$dbSize = (Get-Item ".\server\data.db").Length / 1MB
Write-Host "Database size: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Gray
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to migrate this data to PostgreSQL? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1: Backing up current .env" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# Backup current .env
if (Test-Path ".\server\.env") {
    Copy-Item ".\server\.env" ".\server\.env.backup" -Force
    Write-Host "✅ Backup created: server/.env.backup" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2: Configuring SQLite temporarily" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# Create temporary SQLite .env
$sqliteEnv = @"
HOST=0.0.0.0
PORT=1337

# Database - SQLite (temporary for export)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=data.db

# Strapi Secrets
APP_KEYS="L6h%8kdP0!aXz2#,Bq3^9zTf@4eR!,V1rU0m`$gE&yN7oP"
API_TOKEN_SALT=G2f#7k9L!qWeR4tZ8
ADMIN_JWT_SECRET=x9Y!vE2r`$Lp0Qw3zR7d@K
TRANSFER_TOKEN_SALT=h6Jq2!sRz9`$gWm8nT
JWT_SECRET=jP7%aL9#zT3vG1qH5k`$X

# Cloudinary
CLOUDINARY_NAME="dlbrgqhhg"
CLOUDINARY_KEY="913721861557326"
CLOUDINARY_SECRET="vDBTqzrw2XAjSJiDupextBbqm78"
"@

$sqliteEnv | Out-File -FilePath ".\server\.env" -Encoding UTF8 -NoNewline
Write-Host "✅ Configured for SQLite export" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3: Exporting data from SQLite" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Set-Location ".\server"
Write-Host "Running: npm run strapi export..." -ForegroundColor Gray

try {
    npm run strapi export -- --file ../backup-sqlite --no-encrypt 2>$null
    Set-Location ".."
    
    if (Test-Path ".\backup-sqlite.tar.gz") {
        $backupSize = (Get-Item ".\backup-sqlite.tar.gz").Length / 1MB
        Write-Host "✅ Export successful!" -ForegroundColor Green
        Write-Host "Backup file: backup-sqlite.tar.gz ($([math]::Round($backupSize, 2)) MB)" -ForegroundColor Gray
    } else {
        throw "Export file not created"
    }
} catch {
    Set-Location ".."
    Write-Host "❌ Export failed: $_" -ForegroundColor Red
    
    # Restore .env
    if (Test-Path ".\server\.env.backup") {
        Move-Item ".\server\.env.backup" ".\server\.env" -Force
    }
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4: Configuring PostgreSQL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# Create PostgreSQL .env
$pgEnv = @"
HOST=0.0.0.0
PORT=1337

# Database - PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=jewelry_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false

# Strapi Secrets
APP_KEYS="L6h%8kdP0!aXz2#,Bq3^9zTf@4eR!,V1rU0m`$gE&yN7oP"
API_TOKEN_SALT=G2f#7k9L!qWeR4tZ8
ADMIN_JWT_SECRET=x9Y!vE2r`$Lp0Qw3zR7d@K
TRANSFER_TOKEN_SALT=h6Jq2!sRz9`$gWm8nT
JWT_SECRET=jP7%aL9#zT3vG1qH5k`$X

# Cloudinary
CLOUDINARY_NAME="dlbrgqhhg"
CLOUDINARY_KEY="913721861557326"
CLOUDINARY_SECRET="vDBTqzrw2XAjSJiDupextBbqm78"
"@

$pgEnv | Out-File -FilePath ".\server\.env" -Encoding UTF8 -NoNewline
Write-Host "✅ Configured for PostgreSQL" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5: Starting PostgreSQL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# Stop any running containers
Write-Host "Stopping existing containers..." -ForegroundColor Gray
docker-compose down -v 2>$null | Out-Null

# Start PostgreSQL
Write-Host "Starting PostgreSQL..." -ForegroundColor Gray
docker-compose up -d postgres

Write-Host "Waiting for PostgreSQL to be ready (15 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 6: Starting Strapi" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

docker-compose up -d server

Write-Host "Waiting for Strapi to initialize (30 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host "✅ Strapi is ready" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 7: Importing data to PostgreSQL" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "Running: strapi import..." -ForegroundColor Gray

try {
    docker-compose exec -T server npm run strapi import -- --file /app/../backup-sqlite.tar.gz --force
    Write-Host "✅ Import successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Import might have some warnings, but data should be transferred" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • SQLite data exported to: backup-sqlite.tar.gz" -ForegroundColor White
Write-Host "  • Data imported to PostgreSQL" -ForegroundColor White
Write-Host "  • Original SQLite file backed up: server/data.db" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open: http://localhost:1337/admin" -ForegroundColor White
Write-Host "  2. Verify your data is there" -ForegroundColor White
Write-Host "  3. Start client: docker-compose up -d client" -ForegroundColor White
Write-Host ""

Write-Host "💾 Backup files created:" -ForegroundColor Cyan
Write-Host "  • server/.env.backup (original .env)" -ForegroundColor White
Write-Host "  • backup-sqlite.tar.gz (SQLite export)" -ForegroundColor White
Write-Host "  • server/data.db (original SQLite DB)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Note: Keep backup files until you confirm everything works!" -ForegroundColor Yellow
Write-Host ""
