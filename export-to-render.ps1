# =====================================================
# EXPORT LOCAL DATABASE → IMPORT TO RENDER
# =====================================================

Write-Host "🔄 EXPORT LOCAL DATABASE TO RENDER" -ForegroundColor Cyan
Write-Host ""

# Step 1: Export from Local Docker PostgreSQL
Write-Host "📤 Step 1: Exporting from Local PostgreSQL..." -ForegroundColor Yellow
docker exec jewelry-postgres pg_dump -U strapi -d jewelry_db -F c -f /tmp/render_export.dump

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Export failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Copy dump file from container to host
Write-Host "📋 Step 2: Copying dump file to host..." -ForegroundColor Yellow
docker cp jewelry-postgres:/tmp/render_export.dump ./render_export.dump

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Copy failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Export successful: render_export.dump" -ForegroundColor Green
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS - IMPORT TO RENDER:" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Upload file to Render database:" -ForegroundColor White
Write-Host "   - Go to: Render Dashboard → PostgreSQL Database" -ForegroundColor Gray
Write-Host "   - Click 'Connect' → Get connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Install PostgreSQL client (if not installed):" -ForegroundColor White
Write-Host "   winget install PostgreSQL.PostgreSQL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restore to Render database:" -ForegroundColor White
Write-Host "   pg_restore --verbose --clean --no-acl --no-owner \" -ForegroundColor Gray
Write-Host "     -h dpg-d42v9d75r7bs73be5vfg-a.oregon-postgres.render.com \" -ForegroundColor Gray
Write-Host "     -U strapi -d jewelry_db_4n4f render_export.dump" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Hoặc dùng pgAdmin / DBeaver để import" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Render database sẽ bị OVERWRITE!" -ForegroundColor Red
Write-Host ""
