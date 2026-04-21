# Admin Panel API Reference

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication:** Bearer Token in Authorization header  
**Content-Type:** `application/json`

---

## Authentication Endpoints

### Admin Login
```
POST /admin/login
```

**Request:**
```json
{
  "email": "admin@skillbridge.co.in",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Admin User",
    "email": "admin@skillbridge.co.in",
    "role": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Admin login successful"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

**Error Codes:**
- `INVALID_CREDENTIALS` - Email/password incorrect

---

## Dashboard Endpoints

### Get Dashboard Overview
```
GET /admin/dashboard
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "admins": 3,
      "students": 147
    },
    "programs": {
      "total": 8,
      "enrollments": 450,
      "avgEnrollmentPerProgram": 56
    },
    "submissions": {
      "pending": 12
    },
    "certificates": {
      "paid": 324
    },
    "revenue": {
      "total": 45000,
      "currency": "INR"
    }
  },
  "message": "Dashboard overview retrieved successfully"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Session expired. Please login again.",
  "code": "TOKEN_EXPIRED"
}
```

---

## User Management Endpoints

### Get All Users
```
GET /admin/users?page=1&limit=10&search=name&role=ADMIN
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search by name or email
- `role` (optional) - Filter by role: ADMIN, USER, INTERN

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "college": "MIT",
        "year": "2nd Year",
        "emailVerified": true,
        "createdAt": "2026-04-21T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10
  },
  "message": "Users retrieved successfully"
}
```

---

### Get User Details
```
GET /admin/user/{userId}
```

**Path Parameters:**
- `userId` - UUID of the user

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "college": "MIT",
    "year": "2nd Year",
    "emailVerified": true,
    "createdAt": "2026-04-21T10:30:00Z",
    "internships": [
      {
        "id": "internship-uuid",
        "internship": {
          "id": "prog-uuid",
          "title": "Web Development Internship",
          "domain": "Web Development"
        }
      }
    ],
    "submissions": [
      {
        "status": "APPROVED",
        "task": {
          "id": "task-uuid",
          "title": "Build REST API"
        }
      }
    ],
    "certificates": [
      {
        "id": "cert-uuid",
        "internship": {
          "title": "Web Development Internship"
        }
      }
    ],
    "payments": [
      {
        "id": "payment-uuid",
        "amount": 5000,
        "status": "SUCCESS",
        "currency": "INR",
        "createdAt": "2026-04-15T12:00:00Z"
      }
    ],
    "counts": {
      "internships": 2,
      "submissions": 5,
      "finalSubmissions": 1,
      "certificates": 1,
      "payments": 1
    }
  },
  "message": "User details retrieved successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

### Create Admin User
```
POST /admin/create-user
```

**Request:**
```json
{
  "name": "New Admin",
  "email": "admin2@skillbridge.co.in",
  "password": "SecurePass123!",
  "role": "ADMIN"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-uuid",
      "name": "New Admin",
      "email": "admin2@skillbridge.co.in",
      "role": "ADMIN",
      "createdAt": "2026-04-21T10:30:00Z"
    }
  },
  "message": "User account created successfully"
}
```

**Error (403 Forbidden - for ADMIN role):**
```json
{
  "success": false,
  "message": "Only super-admins can create ADMIN users",
  "code": "INSUFFICIENT_PRIVILEGE"
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "message": "A user with this email already exists",
  "code": "USER_EXISTS"
}
```

---

### Update User Role
```
PATCH /admin/user/{userId}/role
```

**Request:**
```json
{
  "role": "ADMIN"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN",
      "updatedAt": "2026-04-21T10:30:00Z"
    }
  },
  "message": "User role updated to ADMIN"
}
```

**Note:** After role update, user's tokenVersion is incremented, invalidating their current sessions.

---

## Submission Management

### Get Submissions
```
GET /admin/submissions?status=SUBMITTED&internshipId=uuid
```

**Query Parameters:**
- `status` (optional) - SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
- `internshipId` (optional) - Filter by internship

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "submission-uuid",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "college": "MIT"
        },
        "internship": {
          "id": "prog-uuid",
          "title": "Web Development",
          "domain": "Backend"
        },
        "projectTitle": "E-Commerce API",
        "projectLink": "https://github.com/user/project",
        "description": "Built REST API with Express.js",
        "status": "SUBMITTED",
        "submittedAt": "2026-04-20T15:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 50
  },
  "message": "Pending submissions retrieved successfully"
}
```

---

### Review Final Submission
```
PATCH /admin/final-submission/{submissionId}
```

**Request:**
```json
{
  "status": "APPROVED",
  "feedback": "Great implementation! Well done."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "submission-uuid",
      "status": "APPROVED",
      "feedback": "Great implementation! Well done.",
      "updatedAt": "2026-04-21T10:30:00Z"
    },
    "certificate": {
      "id": "cert-uuid",
      "certificateId": "CERT-2026-001",
      "issuedDate": "2026-04-21T10:30:00Z"
    }
  },
  "message": "Final project submission approved successfully"
}
```

**Note:** When approved, a certificate is automatically generated for the user.

---

## Certificate Management

### Get Certificates
```
GET /admin/certificates?page=1&limit=10
```

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cert-uuid",
        "certificateId": "CERT-2026-001",
        "studentName": "John Doe",
        "email": "john@example.com",
        "college": "MIT",
        "internship": "Web Development Internship",
        "domain": "Backend",
        "issuedDate": "2026-04-20T12:00:00Z",
        "isPaid": true,
        "viewUrl": "/certificate/CERT-2026-001",
        "downloadUrl": "/certificate/CERT-2026-001"
      }
    ],
    "total": 324,
    "page": 1,
    "limit": 10
  },
  "message": "Certificates retrieved successfully"
}
```

---

## Support Tickets

### Get Tickets
```
GET /admin/tickets?status=OPEN
```

**Query Parameters:**
- `status` (optional) - OPEN, IN_PROGRESS, RESOLVED, CLOSED

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "ticket-uuid",
        "subject": "Cannot access dashboard",
        "message": "I'm getting a 403 error when trying to access the dashboard.",
        "status": "OPEN",
        "userId": "user-uuid",
        "createdAt": "2026-04-21T09:00:00Z",
        "replies": []
      }
    ]
  },
  "message": "Tickets retrieved successfully"
}
```

---

### Update Ticket Status
```
PATCH /admin/tickets/{ticketId}
```

**Request:**
```json
{
  "status": "RESOLVED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket-uuid",
      "status": "RESOLVED",
      "updatedAt": "2026-04-21T10:30:00Z"
    }
  },
  "message": "Ticket status updated"
}
```

---

### Reply to Ticket
```
POST /admin/tickets/reply
```

**Request:**
```json
{
  "ticketId": "ticket-uuid",
  "reply": "Your issue has been resolved. Please clear your browser cache and try again.",
  "status": "RESOLVED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket-uuid",
      "status": "RESOLVED",
      "replies": [
        {
          "id": "reply-uuid",
          "message": "Your issue has been resolved. Please clear your browser cache and try again.",
          "createdAt": "2026-04-21T10:30:00Z"
        }
      ]
    }
  },
  "message": "Reply added successfully"
}
```

---

## Email Management

### Send Admin Email
```
POST /admin/send-email
```

**Request:**
```json
{
  "userId": "user-uuid",
  "templateType": "SELECTION",
  "params": {
    "programTitle": "Web Development Internship",
    "cohort": "Summer 2026",
    "startDate": "May 1, 2026"
  }
}
```

**Template Types:**
- `SELECTION` - Congratulations, you've been selected
- `PAYMENT` - Payment instructions
- `OFFER` - Offer letter
- `ONBOARDING` - Welcome onboard
- `REJECTION` - Application rejected

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "templateType": "SELECTION",
    "email": "john@example.com"
  },
  "message": "Email dispatched successfully to john@example.com"
}
```

---

## Analytics

### Get Internship Analytics
```
GET /admin/internship/{internshipId}/analytics
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "internship": {
      "id": "prog-uuid",
      "title": "Web Development Internship",
      "domain": "Web Development",
      "taskCount": 15
    },
    "enrollments": 234,
    "submissions": {
      "total": 185,
      "byStatus": {
        "SUBMITTED": 45,
        "UNDER_REVIEW": 20,
        "APPROVED": 110,
        "REJECTED": 10
      }
    },
    "certificates": {
      "generated": 110,
      "paid": 95,
      "unpaid": 15
    },
    "revenue": {
      "total": 47500,
      "currency": "INR"
    }
  },
  "message": "Internship analytics retrieved successfully"
}
```

---

## Error Responses

### Common Error Codes

| Code | Status | Message |
|------|--------|---------|
| `NO_TOKEN` | 401 | Not authorized, no token |
| `TOKEN_EXPIRED` | 401 | Session expired. Please login again. |
| `TOKEN_INVALID` | 401 | Not authorized, token is invalid |
| `USER_NOT_FOUND` | 404 | User not found |
| `USER_EXISTS` | 409 | A user with this email already exists |
| `INSUFFICIENT_PRIVILEGE` | 403 | Only super-admins can perform action |
| `FORBIDDEN` | 403 | Forbidden: admin access required |
| `VALIDATION_ERROR` | 400 | Validation failed |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |

---

## Authentication Headers

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQiLCJwdXJwb3NlIjoiYXV0aCIsImlhdCI6MTcxMzY4OTQwMCwiZXhwIjoxNzE0Mjk0MjAwLCJpc3MiOiJza2lsbGJyaWRnZS1hcGkiLCJhdWQiOiJza2lsbGJyaWRnZS1jbGllbnQifQ...
```

**Token Details:**
- **Type:** Bearer Token
- **Format:** JWT (JSON Web Token)
- **Expiry:** 7 days
- **Secret:** JWT_SECRET from .env

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit:** 100 requests per 15 minutes per IP
- **Response Header:** `X-RateLimit-Remaining`

When rate limited:
```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## CORS Policy

The API accepts requests from:
```
http://localhost:3000        (development)
https://skillbridge.co.in    (production)
https://www.skillbridge.co.in (production)
```

Configure `FRONTEND_URL` in `backend/.env` to add more origins.

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillbridge.co.in","password":"password"}'

# Get Dashboard (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer TOKEN"

# Get Users
curl -X GET "http://localhost:5000/api/v1/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"

# Create User
curl -X POST http://localhost:5000/api/v1/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"New User","email":"new@example.com","password":"Pass123!","role":"USER"}'
```

---

## Additional Resources

- [Admin Setup Guide](ADMIN_PANEL_SETUP_GUIDE.md)
- [Audit Report](ADMIN_PANEL_AUDIT_REPORT.md)
- [Quick Start](ADMIN_QUICK_START.md)
