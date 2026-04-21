# Admin Panel - Quick Start Guide (5 Minutes)

## 🚀 Get Admin Panel Running in 5 Minutes

### Prerequisites
- Node.js 20.x or later
- PostgreSQL (or Neon cloud database)
- Two terminal windows

---

## Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Copy environment file (if not already done)
cp .env.example .env

# Install dependencies
npm install

# Create admin user (generates secure password)
npm run seed:admin
# 💾 SAVE THE PASSWORD OUTPUT! You'll need it to login

# Start backend server
npm run dev
# Backend is now running on http://localhost:5000
```

---

## Step 2: Frontend Setup (1 minute)

```bash
# In a NEW terminal window, in root directory
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local

# Start frontend server
npm run dev
# Frontend is now running on http://localhost:3000
```

---

## Step 3: Login (2 minutes)

1. Open browser and go to: **http://localhost:3000/admin**

2. Enter login credentials:
   - **Email:** `admin@skillbridge.co.in`
   - **Password:** [From Step 1 output]

3. Click **Sign In**

4. You should see the admin dashboard ✅

---

## ✅ What You Should See

### Login Page
- Professional login form
- Sidebar with security features
- "Admin Portal" heading

### Dashboard
- **Overview Tab**: User count, programs, submissions, revenue
- **Submissions Tab**: Project submissions to review
- **Users Tab**: List of all users
- **Certificates Tab**: Issued certificates
- **Tickets Tab**: Support tickets
- **Emails Tab**: Screening leads and email templates

---

## 🧪 Quick Tests

### Test 1: Dashboard Data Loads
✅ Navigate to Admin > Dashboard  
✅ See metrics (users, programs, revenue, etc.)  
✅ No errors in browser console

### Test 2: User Management
✅ Navigate to Admin > Users  
✅ See list of users  
✅ Search for a user  
✅ Click user to see details

### Test 3: Create New User
✅ Navigate to Admin > Users  
✅ Click "Create User" button  
✅ Fill in name, email, password, role  
✅ Submit and see confirmation

### Test 4: Logout
✅ Click logout button  
✅ Redirected to login page  
✅ Cannot access admin routes without login

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Route not found"** | Make sure backend is running: `npm run dev` in backend directory |
| **"Session expired"** | Clear browser cookies/storage: DevTools → Application → Clear Storage |
| **Blank dashboard** | Check browser console (F12) for errors, look at network tab |
| **Can't login** | Verify email/password from `npm run seed:admin` output |
| **Database error** | Verify DATABASE_URL in `backend/.env` is correct |
| **CORS errors** | Check that NEXT_PUBLIC_API_URL is set in root `.env.local` |

---

## 📞 Still Having Issues?

1. **Check that BOTH servers are running:**
   ```bash
   # Terminal 1 should show: "listening on port 5000"
   # Terminal 2 should show: "ready on http://localhost:3000"
   ```

2. **Verify environment variables:**
   ```bash
   # In backend directory
   grep JWT_SECRET .env
   # Should output a long string
   ```

3. **Test backend API directly:**
   ```bash
   curl http://localhost:5000/api/v1/health
   # Should return success
   ```

4. **Check database connection:**
   ```bash
   # In backend directory
   npx prisma db execute --stdin <<< "SELECT 1;"
   # Should return 1 (no errors)
   ```

---

## 📚 Next Steps

After logging in:

1. **Review Dashboard**: See all admin metrics
2. **Manage Users**: Create, view, and update users
3. **Review Submissions**: Approve or reject user projects
4. **Send Emails**: Use templates to communicate with users
5. **Manage Tickets**: Handle support requests from users

---

## 🔑 Key Files Reference

### Backend
- Routes: `backend/routes/admin.js`
- Controllers: `backend/controllers/adminController.js`
- Auth: `backend/middleware/authMiddleware.js`
- Database: `backend/prisma/schema.prisma`

### Frontend
- Login: `src/app/admin/page.tsx`
- Dashboard: `src/app/admin/dashboard/page.tsx`
- API Client: `src/lib/api.ts`
- Auth Context: `src/context/AuthContext.tsx`

---

## 🎓 Admin Features

### Dashboard Overview
- Total users, admins, students
- Program count & enrollments
- Pending submissions
- Revenue metrics
- Certificate statistics

### User Management
- View all users with pagination
- Search by name/email
- Filter by role
- View user details with history
- Update user roles (if super-admin)

### Submissions
- View all project submissions
- Filter by status
- Approve/reject with feedback
- Auto-generate certificates on approval

### Certificates
- View issued certificates
- See certificate details
- Link to certificate viewer

### Support Tickets
- View support tickets
- Filter by status
- Reply to tickets
- Close/resolve tickets

### Email Templates
- Send selection emails
- Send payment emails
- Send offer emails
- Send onboarding emails
- Track email delivery

---

## 💡 Pro Tips

1. **Change Admin Password**: After first login, reset your password for security
2. **Super Admin Setup**: Add your email to SUPER_ADMIN_EMAILS in `.env` to promote other admins
3. **Email Testing**: Use real email in SMTP_USER to test email functionality
4. **Database Backup**: Regularly backup your PostgreSQL database
5. **Monitor Logs**: Keep an eye on logs for any errors: `npm run dev`

---

## ✨ That's it!

Your admin panel is now fully functional. Start managing users, reviewing submissions, and running your internship program!

**Questions?** See full documentation in:
- `ADMIN_PANEL_SETUP_GUIDE.md` - Comprehensive setup guide
- `ADMIN_PANEL_AUDIT_REPORT.md` - Complete audit report

**Happy admin-ing!** 🎉
