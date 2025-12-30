# Lint and Format Script
# This script runs linting and formatting commands in sequence

Write-Host "Starting lint and format process..." -ForegroundColor Cyan

# Step 1: Run linting
Write-Host "`n==> Running linting..." -ForegroundColor Yellow
pnpm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Linting found issues. Proceeding to fix..." -ForegroundColor Yellow
}

# Step 2: Fix linting issues
Write-Host "`n==> Fixing linting issues..." -ForegroundColor Yellow
pnpm run lint:fix
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error fixing linting issues!" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 3: Format code
Write-Host "`n==> Formatting code..." -ForegroundColor Yellow
pnpm run format
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error formatting code!" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 4: Check code formatting
Write-Host "`n==> Checking code formatting..." -ForegroundColor Yellow
pnpm run format:check
if ($LASTEXITCODE -ne 0) {
    Write-Host "Format check failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n==> All steps completed successfully!" -ForegroundColor Green
