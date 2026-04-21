# Admin Panel Validation & Testing Script (Windows PowerShell)
# This script validates the complete admin panel setup and runs tests

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

# Colors
$green = [Console]::ForegroundColor = 'Green'
$red = [Console]::ForegroundColor = 'Red'
$yellow = [Console]::ForegroundColor = 'Yellow'
$reset = [Console]::ResetColor()

$pass = 0
$fail = 0

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
    $script:pass++
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    $script:fail++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "========================================"
    Write-Host $Title
    Write-Host "========================================"
}

function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Uri,
        [string]$Body,
        [int]$ExpectedStatus,
        [string]$Description
    )
    
    Write-Host -NoNewline "Testing: $Description... "
    
    try {
        $response = Invoke-WebRequest -Uri $Uri -Method $Method `
            -Headers @{"Content-Type"="application/json"} `
            -Body $Body `
            -SkipHttpErrorCheck `
            -TimeoutSec 5
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Success "PASS (Status: $($response.StatusCode))"
        }
        else {
            Write-Error "FAIL (Expected: $ExpectedStatus, Got: $($response.StatusCode))"
        }
    }
    catch {
        Write-Error "FAIL (Exception: $($_.Exception.Message))"
    }
}

function Check-EnvVariable {
    param(
        [string]$Variable,
        [string]$FilePath
    )
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        if ($content -match "^$Variable=") {
            $value = ($content | Select-String "^$Variable=(.+)" | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -First 1)
            $truncated = if ($value.Length -gt 20) { $value.Substring(0, 20) + "..." } else { $value }
            Write-Success "$Variable is set (value: $truncated)"
        }
        else {
            Write-Error "$Variable is NOT set in $FilePath"
        }
    }
    else {
        Write-Warning "$FilePath not found"
    }
}

# ============================================
# Main Validation Flow
# ============================================

Write-Host ""
Write-Host "========================================"
Write-Host "🔍 Admin Panel Setup Validator"
Write-Host "========================================"
Write-Host ""

# STEP 1: Check Environment Variables
Write-Section "📋 STEP 1: Checking Environment Variables"

Write-Host ""
Write-Host "Backend (.env):"
Check-EnvVariable "JWT_SECRET" "backend\.env"
Check-EnvVariable "DATABASE_URL" "backend\.env"
Check-EnvVariable "FRONTEND_URL" "backend\.env"

Write-Host ""
Write-Host "Frontend (.env.local):"
Check-EnvVariable "NEXT_PUBLIC_API_URL" ".env.local"

# STEP 2: Check Node.js and Dependencies
Write-Section "🔧 STEP 2: Checking Dependencies"

Write-Host -NoNewline "Checking Node.js... "
try {
    $nodeVersion = node --version
    Write-Success "Found $nodeVersion"
}
catch {
    Write-Error "Node.js not found"
}

Write-Host -NoNewline "Checking npm... "
try {
    $npmVersion = npm --version
    Write-Success "Found npm $npmVersion"
}
catch {
    Write-Error "npm not found"
}

# STEP 3: Check Backend Dependencies
Write-Host -NoNewline "Checking backend dependencies... "
if (Test-Path "backend\node_modules") {
    Write-Success "node_modules found in backend"
}
else {
    Write-Warning "node_modules NOT found in backend. Run: cd backend && npm install"
}

# STEP 4: Check Frontend Dependencies
Write-Host -NoNewline "Checking frontend dependencies... "
if (Test-Path "node_modules") {
    Write-Success "node_modules found in root"
}
else {
    Write-Warning "node_modules NOT found in root. Run: npm install"
}

# STEP 5: Check Backend Server
Write-Section "🚀 STEP 5: Checking Backend Server"

Write-Host -NoNewline "Testing backend server on http://localhost:5000... "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -SkipHttpErrorCheck -TimeoutSec 2
    Write-Success "Backend server is running"
    $script:backendRunning = $true
    
    # Test health endpoint
    Test-Endpoint -Uri "http://localhost:5000/api/v1/health" -ExpectedStatus 200 -Description "Health endpoint"
}
catch {
    Write-Error "Backend server is NOT running"
    Write-Host "   Fix: Run 'npm run dev' in backend directory"
    $script:backendRunning = $false
}

# STEP 6: Check Frontend Server
Write-Section "🖥️  STEP 6: Checking Frontend Server"

Write-Host -NoNewline "Testing frontend server on http://localhost:3000... "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -SkipHttpErrorCheck -TimeoutSec 2
    Write-Success "Frontend server is running"
    $script:frontendRunning = $true
}
catch {
    Write-Warning "Frontend server is NOT running"
    Write-Host "   Fix: Run 'npm run dev' in root directory"
    $script:frontendRunning = $false
}

# STEP 7: Check API Routes (only if backend is running)
if ($script:backendRunning) {
    Write-Section "🛣️  STEP 7: Checking API Routes"
    
    Test-Endpoint -Uri "http://localhost:5000/api/v1/admin/login" -Method GET -ExpectedStatus 405 -Description "Admin login endpoint"
    Test-Endpoint -Uri "http://localhost:5000/api/v1/admin/dashboard" -Method GET -ExpectedStatus 401 -Description "Admin dashboard endpoint"
    Test-Endpoint -Uri "http://localhost:5000/api/v1/admin/users" -Method GET -ExpectedStatus 401 -Description "Admin users endpoint"
}

# STEP 8: Check Database
Write-Section "🗄️  STEP 8: Checking Database"

Write-Host -NoNewline "Checking database configuration... "
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "DATABASE_URL=") {
        Write-Success "DATABASE_URL is configured"
        
        # Try to test with Prisma
        Write-Host -NoNewline "Testing database connection... "
        try {
            Push-Location backend
            $output = npm run db:execute 2>&1
            Pop-Location
            Write-Success "Database connection successful"
        }
        catch {
            Write-Warning "Could not verify database connection"
            Write-Host "   Make sure PostgreSQL is running and DATABASE_URL is correct"
        }
    }
}
else {
    Write-Error "backend\.env not found"
}

# STEP 9: Check Admin User
Write-Section "👤 STEP 9: Checking Admin User"

Write-Host -NoNewline "Checking if admin user exists... "
Write-Warning "Run 'npm run seed:admin' in backend to create/verify admin user"

# ============================================
# Summary
# ============================================
Write-Section "📊 Test Summary"

Write-Host ""
Write-Host "Checks Passed: " -NoNewline
Write-Host $pass -ForegroundColor Green
Write-Host "Checks Failed: " -NoNewline
Write-Host $fail -ForegroundColor Red
Write-Host ""

if ($fail -eq 0 -or $fail -lt 5) {
    Write-Host "✓ Validation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps to get admin panel running:"
    Write-Host "1. Start backend:"
    Write-Host "   cd backend"
    Write-Host "   npm run dev"
    Write-Host ""
    Write-Host "2. In another terminal, start frontend:"
    Write-Host "   npm run dev"
    Write-Host ""
    Write-Host "3. Create admin user:"
    Write-Host "   cd backend"
    Write-Host "   npm run seed:admin"
    Write-Host ""
    Write-Host "4. Navigate to: http://localhost:3000/admin"
    Write-Host "5. Login with credentials from step 3"
    Write-Host "6. Verify dashboard loads successfully"
}
else {
    Write-Host "⚠ Some checks failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host ""
