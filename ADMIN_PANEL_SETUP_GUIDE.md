# Admin Panel Complete Setup & Implementation Guide

## 🎯 Overview

This guide provides a complete walkthrough for setting up and fixing the admin panel system. The admin panel includes:

- ✅ Admin authentication (login/logout)
- ✅ Dashboard with analytics
- ✅ User management (CRUD)
- ✅ Submission review
- ✅ Certificate management
- ✅ Ticket management
- ✅ Email dispatch

---

## 📋 STEP-BY-STEP SETUP

### STEP 1: Database Configuration

#### 1a. Ensure PostgreSQL is Running
```bash
# Verify PostgreSQL is running
psql --version

# If using Neon (cloud):
# DATABASE_URL should be set in .env
```

#### 1b. Run Prisma Migrations
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Apply migrations (if any pending)
npx prisma migrate deploy

# If migrations are new, create them
npx prisma migrate dev --name init
```

#### 1c. Verify Database Schema (Safe Approach)
```bash
# Use safe migrations to preserve existing data
cd backend

# Create a migration to update schema (preserves all data!)
npx prisma migrate dev --name sync_schema

# This will:
# ✅ Keep all existing tables and data
# ✅ Add any missing tables
# ✅ Update schema to match prisma.schema
# ❌ Will NOT delete any data
```

---

### STEP 2: Seed Admin User

#### 2a. Create Admin User
```bash
cd backend

# Run the admin seed script
npm run seed:admin

# You'll see output like:
# ✅ Admin user created successfully!
# 📊 Admin Details:
#    Email: admin@mohit.in
#    Password: admin123
```

#### 2b. Save Credentials Securely
- **Email:** `admin@mohit.in`
- **Password:** `admin123`
- Store these credentials securely
- Change password after first login for security

---

### STEP 3: Backend Configuration

#### 3a. Setup Environment Variables (backend/.env)
```bash
cp backend/.env.example backend/.env
```

#### 3b. Verify .env Contains:
```
DATABASE_URL=your_database_url
JWT_SECRET=YcF5i2qzFTNje3RhFHPoe1Uf1MFMmEq7J8k4xEjNADn
JWT_RESET_SECRET=Rk9pXmT2LwVnQ8dHjB3sYeA6uZcFgI0oNxW7rU5lKbMh
JWT_VERIFY_EMAIL_SECRET=Ev4mJqD9aXsP1hLkN6wC0tRyG8fZbU2oI3eVxMjS5rWn
SUPER_ADMIN_EMAILS=admin@mohit.in
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_USER=noreply@skillbridge.co.in
SMTP_PASS=ULC9YivH2JAy
RAZORPAY_KEY_ID=rzp_test_SbtFr7pwkrPTMr
RAZORPAY_KEY_SECRET=3vCFhl5U26iZoYfy1paAXdV5
NODE_ENV=development
```

#### 3c. Install Dependencies
```bash
cd backend
npm install
```

#### 3d. Start Backend Server
```bash
npm run dev
# Server should start on http://localhost:5000
```

---

### STEP 4: Frontend Configuration

#### 4a. Setup Environment Variables (root/.env.local)
```bash
# Create .env.local in root directory
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

#### 4b. Install Dependencies
```bash
npm install
```

#### 4c. Start Frontend Dev Server
```bash
npm run dev
# Frontend should start on http://localhost:3000
```

---

### STEP 5: Test Admin Login

#### 5a. Navigate to Admin Login
```
URL: http://localhost:3000/admin
```

#### 5b. Login with Credentials
```
Email: admin@mohit.in
Password: admin123
```

#### 5c. Expected Result
- ✅ Login succeeds
- ✅ Redirects to /admin/dashboard
- ✅ Dashboard loads with data
- ✅ No "Session expired" errors

---

### STEP 6: Test Admin Features

#### 6a. Dashboard Overview
- Users count
- Programs count
- Submissions pending
- Revenue metrics
- Certificates issued

#### 6b. User Management
```
Navigate to: Admin > Users

Expected Actions:
✅ View all users (paginated)
✅ Search users by name/email
✅ Filter by role (USER, ADMIN, INTERN)
✅ View user details
✅ Update user role (if super-admin)
```

#### 6c. Submission Review
```
Navigate to: Admin > Submissions

Expected Actions:
✅ View all project submissions
✅ Filter by status
✅ Approve/Reject submissions
✅ Add feedback
✅ Auto-generate certificate on approval
```

#### 6d. Certificates
```
Navigate to: Admin > Certificates

Expected Actions:
✅ View issued certificates
✅ See certificate details
✅ Verify certificate links
```

#### 6e. Tickets (Support)
```
Navigate to: Admin > Tickets

Expected Actions:
✅ View support tickets
✅ Filter by status
✅ Reply to tickets
✅ Close/resolve tickets
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Session expired" errors

**Cause:** JWT token validation failing

**Fix:**
```bash
# Verify JWT_SECRET is same everywhere
grep JWT_SECRET backend/.env

# Restart backend server
npm run dev

# Clear browser cache and localStorage
# In browser console:
# localStorage.removeItem('sb_token')
# localStorage.removeItem('sb_user')
```

### Issue 2: "Route not found" (404 errors)

**Cause:** Backend routes not mounted or API base URL wrong

**Fix:**
```bash
# Verify backend is running
curl http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify NEXT_PUBLIC_API_URL in frontend
echo $NEXT_PUBLIC_API_URL

# Should output: http://localhost:5000/api/v1
```

### Issue 3: "Admin access required" (403)

**Cause:** User is not admin role

**Fix:**
```bash
# Check user role in database
psql -c "SELECT id, email, role FROM \"User\" WHERE email='admin@skillbridge.co.in'"

# If not ADMIN, update:
psql -c "UPDATE \"User\" SET role='ADMIN' WHERE email='admin@skillbridge.co.in'"
```

### Issue 4: "Database connection failed"

**Cause:** DATABASE_URL incorrect or database not running

**Fix:**
```bash
# Test database connection
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF

# If fails, verify DATABASE_URL
echo $DATABASE_URL

# For Neon, verify credentials at https://console.neon.tech
```

### Issue 5: "Invalid signature" JWT errors

**Cause:** JWT secret mismatch or token corrupted

**Fix:**
```bash
# Regenerate tokens by logging in again
# Clear localStorage in browser dev tools

# Verify same JWT_SECRET in .env:
cat backend/.env | grep JWT_SECRET

# All should match
```

---

## 🚀 Production Deployment Checklist

### Before Deploying:

- [ ] Change default admin password
- [ ] Generate strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Set SUPER_ADMIN_EMAILS for your organization
- [ ] Configure real Razorpay keys (production keys)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly (allow production domain only)
- [ ] Set up proper logging
- [ ] Enable rate limiting
- [ ] Run security audit

### Example Production .env
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:strong_pass@prod-db.cloud/skillbridge
JWT_SECRET=$(openssl rand -base64 32)
JWT_RESET_SECRET=$(openssl rand -base64 32)
JWT_VERIFY_EMAIL_SECRET=$(openssl rand -base64 32)
SUPER_ADMIN_EMAILS=admin@mohit.in
FRONTEND_URL=https://skillbridge.co.in
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXX
```

---

## 📊 API Endpoints Reference

### Authentication
```
POST /api/v1/admin/login
  Body: { email: string, password: string }
  Response: { token: string, user: {...} }
```

### Dashboard
```
GET /api/v1/admin/dashboard (requires admin auth)
  Response: { users, programs, submissions, revenue, ... }
```

### Users
```
GET /api/v1/admin/users (requires admin auth)  
  Params: ?page=1&limit=10&search=&role=ADMIN
  Response: { items: [...], total, page, limit }

POST /api/v1/admin/create-user (requires admin auth)
  Body: { name, email, password, role }
  Response: { user: {...} }

GET /api/v1/admin/user/:userId (requires admin auth)
  Response: { user details with enrollments, submissions, etc }

PATCH /api/v1/admin/user/:userId/role (requires super-admin)
  Body: { role: 'ADMIN' | 'USER' | 'INTERN' }
  Response: { user: {...} }
```

### Submissions
```
GET /api/v1/admin/submissions (requires admin auth)
  Params: ?status=SUBMITTED&internshipId=
  Response: { items: [...] }

PATCH /api/v1/admin/final-submission/:submissionId (requires admin)
  Body: { status: 'APPROVED'|'REJECTED', feedback?: string }
  Response: { submission, certificate?: {...} }
```

### Certificates
```
GET /api/v1/admin/certificates (requires admin auth)
  Params: ?page=1&limit=10
  Response: { items: [...], total, page, limit }
```

### Tickets
```
GET /api/v1/admin/tickets (requires admin auth)
  Params: ?status=OPEN
  Response: { items: [...] }

PATCH /api/v1/admin/tickets/:id (requires admin auth)
  Body: { status: 'OPEN'|'IN_PROGRESS'|'RESOLVED'|'CLOSED' }
  Response: { ticket: {...} }

POST /api/v1/admin/tickets/reply (requires admin auth)
  Body: { ticketId, reply: string, status?: string }
  Response: { ticket: {...} }
```

### Email
```
POST /api/v1/admin/send-email (requires admin auth)
  Body: { 
    userId: string,
    templateType: 'SELECTION'|'PAYMENT'|'OFFER'|'ONBOARDING',
    params?: { ... }
  }
  Response: { userId, email, templateType }
```

---

## 🧪 Testing Admin Panel

### Manual Testing Checklist
```
[ ] Admin can login with valid credentials
[ ] Admin sees dashboard with all metrics
[ ] Admin can view all users
[ ] Admin can search users
[ ] Admin can view individual user details
[ ] Admin can update user role
[ ] Admin can view submissions
[ ] Admin can approve/reject submissions
[ ] Admin can view certificates
[ ] Admin can manage support tickets
[ ] Admin can reply to tickets
[ ] Admin can send templated emails
[ ] Logout works correctly
[ ] Token expiration works correctly (after 7 days)
[ ] Refresh page maintains login
[ ] Switching tabs maintains session
```

### API Testing (using curl)
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mohit.in","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Test protected endpoint
curl -X GET http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 3. Test user list
curl -X GET "http://localhost:5000/api/v1/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 4. Test invalid token
curl -X GET http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer invalid_token"
  # Should return 401: "Not authorized, token is invalid"
```

---

## 📝 Troubleshooting Guide

### Enable Debug Logging
```bash
# Backend
LOG_LEVEL=debug npm run dev

# Frontend
# Add ?debug=admin to URL to enable console logging
```

### Check Backend Logs
```bash
# View recent logs
tail -f logs/backend.log

# Search for errors
grep ERROR logs/backend.log

# Search for auth issues
grep -i "auth" logs/backend.log
```

### Database Debugging
```bash
# Connect to database directly
psql $DATABASE_URL

# Check admin user exists
SELECT id, email, role, emailVerified FROM "User" WHERE role='ADMIN';

# Check specific admin user
SELECT id, email, role, emailVerified FROM "User" WHERE email='admin@mohit.in';

# Check tokens table (if using token blacklist)
SELECT * FROM "Token" LIMIT 10;

# Reset admin password (if needed)
UPDATE "User" SET password='<new_hash>' WHERE email='admin@mohit.in';
```

---

## 🔐 Security Best Practices

1. **Change Default Credentials**
   - Always change the default admin password immediately after setup

2. **Rotate Secrets**
   - Rotate JWT secrets every 90 days in production
   - Use strong, random secrets (min 32 characters)

3. **Enable HTTPS**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS

4. **Rate Limiting**
   - Backend already implements rate limiting
   - Adjust per your requirements

5. **CORS Configuration**
   - Currently allows localhost:3000 in development
   - Restrict to specific domain in production

6. **Database Security**
   - Use strong database passwords
   - Enable database encryption at rest
   - Regular backups

7. **Audit Logging**
   - All admin actions are logged
   - Review audit logs regularly

---

## 📞 Support

If you encounter issues:

1. Check the logs: `npm run dev` (shows real-time logs)
2. Verify environment variables: `env | grep -i jwt`
3. Test API endpoints directly: `curl -X GET http://localhost:5000/api/v1/health`
4. Clear browser cache and local storage
5. Restart both frontend and backend servers

---

## 📚 Additional Resources

- [Admin Controller Implementation](backend/controllers/adminController.js)
- [Auth Middleware](backend/middleware/authMiddleware.js)
- [RBAC Middleware](backend/middleware/rbacMiddleware.js)
- [Admin Routes](backend/routes/admin.js)
- [Admin Login Frontend](src/app/admin/page.tsx)
- [Admin Dashboard Frontend](src/app/admin/dashboard/page.tsx)
