# Test Railway Build Locally
# Run: .\test-railway-build.ps1

Write-Host "🚀 Testing Railway Production Build Locally..." -ForegroundColor Cyan
Write-Host ""

# Test Server Build
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📦 Building Server (Strapi)..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path ".\server"

if (Test-Path ".\Dockerfile.prod") {
    Write-Host "✅ Found Dockerfile.prod" -ForegroundColor Green
    Write-Host "Building Docker image: jewelry-server-prod" -ForegroundColor Cyan
    
    docker build -f Dockerfile.prod -t jewelry-server-prod:test .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To test run:" -ForegroundColor Cyan
        Write-Host "docker run -p 1337:1337 --env-file .env jewelry-server-prod:test" -ForegroundColor White
    } else {
        Write-Host "❌ Server build failed!" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
} else {
    Write-Host "❌ Dockerfile.prod not found in server/" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Write-Host ""
Set-Location -Path ".."

# Test Client Build
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📦 Building Client (Next.js)..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path ".\client"

if (Test-Path ".\Dockerfile.prod") {
    Write-Host "✅ Found Dockerfile.prod" -ForegroundColor Green
    Write-Host "Building Docker image: jewelry-client-prod" -ForegroundColor Cyan
    
    docker build -f Dockerfile.prod -t jewelry-client-prod:test .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Client build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To test run:" -ForegroundColor Cyan
        Write-Host "docker run -p 3000:3000 --env-file .env jewelry-client-prod:test" -ForegroundColor White
    } else {
        Write-Host "❌ Client build failed!" -ForegroundColor Red
        Set-Location -Path ".."
        exit 1
    }
} else {
    Write-Host "❌ Dockerfile.prod not found in client/" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Set-Location -Path ".."

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ All builds successful!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test images locally" -ForegroundColor White
Write-Host "2. Push code to GitHub" -ForegroundColor White
Write-Host "3. Configure Railway dashboard" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To clean up test images:" -ForegroundColor Yellow
Write-Host "docker rmi jewelry-server-prod:test jewelry-client-prod:test" -ForegroundColor White
Write-Host ""
