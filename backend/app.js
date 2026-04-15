require('dotenv').config();
const { randomUUID } = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApiResponse, ApiError } = require('./utils/apiResponse');
const prisma = require('./prisma');

const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/tasks');
const learningRoutes = require('./routes/learning');
const certificateRoutes = require('./routes/certificates');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Set various HTTP headers for security
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// CORS — restrict to frontend origin in production
const envOrigins = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim().replace(/\/$/, ''));
const allowedOrigins = [
  'https://skillbridge.co.in',
  'https://www.skillbridge.co.in',
  'http://localhost:3000',
  ...envOrigins
].filter(Boolean);

// M5 FIX: Paths that legitimately have no Origin header (health probes, webhooks)
const NO_ORIGIN_ALLOWED_PATHS = ['/health', '/', '/favicon.ico', '/razorpay-webhook', '/webhooks/razorpay'];

const corsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    // In development, allow no-origin requests (curl, Postman)
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // In production, only allow no-origin for health/webhooks
    // (this is checked per-request via the middleware below)
    if (!origin) {
      return callback(null, true); // we check path in middleware
    }
    console.warn(`Blocked by CORS: origin ${origin} not in allowed list [${allowedOrigins}]`);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// M5 FIX: Block no-origin requests to sensitive paths in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.headers.origin && !NO_ORIGIN_ALLOWED_PATHS.includes(req.path)) {
      return res.status(403).json(ApiResponse.error('Origin header required', 403, 'CORS_ORIGIN_REQUIRED'));
    }
    next();
  });
}

// ============================================
// REQUEST PARSING
// ============================================

// Razorpay webhook needs the raw body before JSON parsing consumes the stream.
app.use(['/razorpay-webhook', '/webhooks/razorpay'], express.raw({ type: 'application/json' }));

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// RATE LIMITING (M6 FIX: bounded limits instead of unbounded skip)
// ============================================

// Global rate limiter for mutating/write requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/' || req.path === '/favicon.ico',
});

// Higher limit for read-only/data-fetch endpoints
const readOnlyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ============================================
// M8 FIX: REQUEST CORRELATION ID
// ============================================

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] [${req.id}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    if (res.statusCode >= 400) {
      console.error(log);
    }
  });
  next();
});

// ============================================
// HEALTH & ROOT ENDPOINTS
// ============================================

/**
 * Health Check — includes DB connectivity test for Azure monitoring
 */
app.get('/health', async (req, res) => {
  const dbOk = await prisma.testConnection();
  const status = dbOk ? 'ok' : 'degraded';
  const httpCode = dbOk ? 200 : 503;

  res.status(httpCode).json(ApiResponse.success({
    status,
    uptime: Math.floor(process.uptime()),
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  }));
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json(ApiResponse.success({
    status: 'ok',
    service: 'SkillBridge API',
    version: '1.0.0',
    health: '/health',
    docs: '/api/docs',
  }));
});

/**
 * Favicon (avoid noisy 404 logs for browser auto-requests)
 */
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

/**
 * Api Documentation
 */
app.get('/api/docs', (req, res) => {
  const docs = {
    api: 'SkillBridge API v1',
    baseUrl: process.env.BACKEND_URL || 'http://localhost:5000',
    endpoints: {
      auth: '/auth',
      internships: '/internships',
      dashboard: '/dashboard',
      certificates: '/certificates',
      payments: '/create-order, /verify-payment',
    },
    docs: 'See README.md for full documentation',
  };
  res.json(ApiResponse.success(docs));
});

// ============================================
// API ROUTES (m2 FIX: API Versioning)
// ============================================

const apiRouter = express.Router();

apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/internships', readOnlyLimiter, internshipRoutes);
apiRouter.use('/', userRoutes);
apiRouter.use('/', taskRoutes);
apiRouter.use('/', learningRoutes);
apiRouter.use('/', certificateRoutes);
apiRouter.use('/', ticketRoutes);
apiRouter.use('/admin', readOnlyLimiter, adminRoutes);

app.use('/api/v1', apiRouter);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  const response = ApiResponse.error(
    `Route ${req.method} ${req.path} not found`,
    404,
    'NOT_FOUND'
  );
  res.status(404).json(response);
});

/**
 * Centralized Error Handler (MUST BE LAST)
 */
app.use((err, req, res, next) => {
  // Handle ApiError instances
  if (err instanceof ApiError) {
    const response = ApiResponse.error(
      err.message,
      err.statusCode || 400,
      err.errorCode || 'ERROR',
      err.details
    );
    return res.status(err.statusCode || 400).json(response);
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError') {
    const response = ApiResponse.error(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      err.details
    );
    return res.status(400).json(response);
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    const response = ApiResponse.error(
      'Database error',
      500,
      'DATABASE_ERROR',
      process.env.NODE_ENV === 'development' ? err.message : null
    );
    return res.status(500).json(response);
  }

  // Generic error handler
  console.error('🔴 Unhandled error:', err);
  const response = ApiResponse.error(
    'Internal server error',
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? err.message : null
  );
  res.status(500).json(response);
});

module.exports = app;

