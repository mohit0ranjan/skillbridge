#!/bin/bash

# Admin Panel Validation & Testing Script
# This script validates the complete admin panel setup and runs tests

set -e

echo "========================================"
echo "🔍 Admin Panel Setup Validator"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Test function
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5

    echo -n "Testing: $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" 2>/dev/null || echo "error\n0")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo "error\n0")
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAIL=$((FAIL + 1))
        echo "   Response: $body"
    fi
}

# ============================================
# 1. Check Environment Variables
# ============================================
echo ""
echo "📋 STEP 1: Checking Environment Variables"
echo "========================================"

check_env() {
    local var=$1
    local file=$2
    
    if grep -q "^${var}=" "$file" 2>/dev/null; then
        value=$(grep "^${var}=" "$file" | cut -d'=' -f2 | head -c 20)
        echo -e "${GREEN}✓${NC} $var is set (starts with: $value...)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC} $var is NOT set in $file"
        FAIL=$((FAIL + 1))
    fi
}

echo ""
echo "Backend (.env):"
[ -f "backend/.env" ] && check_env "JWT_SECRET" "backend/.env" || echo -e "${RED}✗${NC} backend/.env not found"
[ -f "backend/.env" ] && check_env "DATABASE_URL" "backend/.env" || echo "   (Skipped)"
[ -f "backend/.env" ] && check_env "FRONTEND_URL" "backend/.env" || echo "   (Skipped)"

echo ""
echo "Frontend (.env.local):"
[ -f ".env.local" ] && check_env "NEXT_PUBLIC_API_URL" ".env.local" || echo -e "${YELLOW}⚠${NC}  .env.local not found (using defaults)"

# ============================================
# 2. Check Database Connection
# ============================================
echo ""
echo "🗄️  STEP 2: Checking Database Connection"
echo "========================================"

if command -v npx &> /dev/null; then
    echo -n "Testing database connection... "
    if (cd backend && npx prisma db execute --stdin <<EOF >/dev/null 2>&1
SELECT 1;
EOF
); then
        echo -e "${GREEN}✓${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC}"
        echo "   Error: Could not connect to database"
        echo "   Fix: Check DATABASE_URL in backend/.env"
        FAIL=$((FAIL + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC}  npx not found, skipping database test"
fi

# ============================================
# 3. Check Backend Server
# ============================================
echo ""
echo "🚀 STEP 3: Checking Backend Server"
echo "========================================"

if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server is running on http://localhost:5000"
    PASS=$((PASS + 1))
    
    # Test health endpoint
    test_endpoint "GET" "http://localhost:5000/api/v1/health" "" "200" "Health endpoint"
else
    echo -e "${RED}✗${NC} Backend server is NOT running"
    echo "   Fix: Run 'npm run dev' in backend directory"
    FAIL=$((FAIL + 1))
    
    echo ""
    echo -e "${YELLOW}⚠${NC}  Skipping remaining backend tests (server not running)"
    echo ""
    echo "Start the backend with:"
    echo "  cd backend && npm run dev"
    exit 1
fi

# ============================================
# 4. Test Authentication Flow
# ============================================
echo ""
echo "🔐 STEP 4: Testing Authentication Flow"
echo "========================================"

# Try login with invalid credentials (should fail)
test_endpoint "POST" "http://localhost:5000/api/v1/admin/login" \
    '{"email":"nonexistent@example.com","password":"wrongpassword"}' \
    "401" "Invalid credentials rejection"

# Check if admin user exists
echo -n "Checking for existing admin user... "
if (cd backend && npx prisma db execute --stdin <<EOF 2>/dev/null | grep -q admin@skillbridge
SELECT email FROM "User" WHERE role = 'ADMIN' LIMIT 1;
EOF
); then
    echo -e "${GREEN}✓${NC}"
    PASS=$((PASS + 1))
    
    # Try to login with correct credentials (would need actual password)
    echo "Note: To test successful login, run: cd backend && npm run seed:admin"
else
    echo -e "${RED}✗${NC}"
    echo "   No admin user found"
    echo "   Fix: Run 'npm run seed:admin' in backend directory"
    FAIL=$((FAIL + 1))
fi

# ============================================
# 5. Check Frontend Server
# ============================================
echo ""
echo "🖥️  STEP 5: Checking Frontend Server"
echo "========================================"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend server is running on http://localhost:3000"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠${NC}  Frontend server is NOT running"
    echo "   Fix: Run 'npm run dev' in root directory"
fi

# ============================================
# 6. Check Routes
# ============================================
echo ""
echo "🛣️  STEP 6: Checking API Routes"
echo "========================================"

test_endpoint "GET" "http://localhost:5000/api/v1/admin/login" "" "405" "Admin login endpoint exists (method not allowed for GET)"
test_endpoint "GET" "http://localhost:5000/api/v1/admin/dashboard" "" "401" "Admin dashboard endpoint exists (requires auth)"
test_endpoint "GET" "http://localhost:5000/api/v1/admin/users" "" "401" "Admin users endpoint exists (requires auth)"

# ============================================
# 7. Summary
# ============================================
echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Seed admin user: cd backend && npm run seed:admin"
    echo "2. Navigate to: http://localhost:3000/admin"
    echo "3. Login with credentials from step 1"
    echo "4. Verify dashboard loads successfully"
else
    echo -e "${YELLOW}⚠ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
