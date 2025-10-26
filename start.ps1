# Jewelry E-commerce - Docker Quick Start Script
# Run this script to start the application

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Jewelry E-commerce Docker Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env file created. Please edit it with your actual keys!" -ForegroundColor Yellow
        Write-Host "Press any key to continue after editing .env..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "✗ .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if ports are available
Write-Host ""
Write-Host "Checking if ports are available..." -ForegroundColor Yellow

$portsInUse = @()

# Check port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $portsInUse += "3000 (Client)"
}

# Check port 1337
$port1337 = Get-NetTCPConnection -LocalPort 1337 -ErrorAction SilentlyContinue
if ($port1337) {
    $portsInUse += "1337 (Server)"
}

# Check port 5432
$port5432 = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port5432) {
    $portsInUse += "5432 (PostgreSQL)"
}

if ($portsInUse.Count -gt 0) {
    Write-Host "⚠ Warning: The following ports are in use:" -ForegroundColor Yellow
    foreach ($port in $portsInUse) {
        Write-Host "  - $port" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Do you want to continue? (Y/N)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ All ports are available" -ForegroundColor Green
}

# Ask user what to do
Write-Host ""
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Start containers (with build)" -ForegroundColor White
Write-Host "2. Start containers (without build)" -ForegroundColor White
Write-Host "3. Stop containers" -ForegroundColor White
Write-Host "4. View logs" -ForegroundColor White
Write-Host "5. Clean and rebuild (WARNING: will delete database!)" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building and starting containers..." -ForegroundColor Cyan
        Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
        docker-compose up --build
    }
    "2" {
        Write-Host ""
        Write-Host "Starting containers..." -ForegroundColor Cyan
        docker-compose up
    }
    "3" {
        Write-Host ""
        Write-Host "Stopping containers..." -ForegroundColor Cyan
        docker-compose down
        Write-Host "✓ Containers stopped" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "Viewing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
        docker-compose logs -f
    }
    "5" {
        Write-Host ""
        Write-Host "⚠ WARNING: This will delete all data including database!" -ForegroundColor Red
        Write-Host "Are you sure? (yes/no)" -ForegroundColor Yellow
        $confirm = Read-Host
        if ($confirm -eq "yes") {
            Write-Host "Cleaning up..." -ForegroundColor Cyan
            docker-compose down -v
            docker system prune -f
            Write-Host "Rebuilding..." -ForegroundColor Cyan
            docker-compose up --build
        } else {
            Write-Host "Cancelled" -ForegroundColor Yellow
        }
    }
    "6" {
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:1337/admin" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
