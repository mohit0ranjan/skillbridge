require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const logger = require('./utils/logger');

let app;
let prisma;

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().positive().optional(),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_RESET_SECRET: Joi.string().min(32).required(),
  JWT_VERIFY_EMAIL_SECRET: Joi.string().min(32).required(),
  FRONTEND_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  RAZORPAY_KEY_ID: Joi.string().min(5).optional(),
  RAZORPAY_KEY_SECRET: Joi.string().min(5).optional(),
  RAZORPAY_KEY_ID_TEST: Joi.string().min(5).optional(),
  RAZORPAY_KEY_SECRET_TEST: Joi.string().min(5).optional(),
  RAZORPAY_KEY_ID_LIVE: Joi.string().min(5).optional(),
  RAZORPAY_KEY_SECRET_LIVE: Joi.string().min(5).optional(),
  SMTP_HOST: Joi.string().allow('', null).optional(),
  SMTP_PORT: Joi.number().integer().positive().optional(),
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASS: Joi.string().min(8).optional(),
  EMAIL_USER: Joi.string().email().optional(),
  EMAIL_PASS: Joi.string().min(8).optional(),
}).unknown(true);

function validateEnvironment() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
  });

  if (!error) return;

  logger.error('startup.env_validation_failed');
  for (const detail of error.details) {
    logger.error('startup.env_validation_error', { message: detail.message });
  }

  process.exit(1);
}

validateEnvironment();

try {
  app = require('./app');
  prisma = require('./prisma');
} catch (err) {
  logger.error('startup.module_init_failed', { error: err?.message });
  process.exit(1);
}

const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, HOST, () => {
  logger.info('startup.server_listening', { host: HOST, port: PORT, env: NODE_ENV });
  logger.info('startup.health_endpoint', { health: `http://${HOST}:${PORT}/health` });

  // Non-blocking DB connectivity probe after HTTP server is up.
  if (typeof prisma.testConnection === 'function') {
    prisma.testConnection().catch(() => {});
  }

  // Ensure default workspace projects exist for interns
  try {
    const { ensureWorkspaceProjects } = require('./controllers/workspaceController');
    ensureWorkspaceProjects().then(() => {
      logger.info('startup.workspace_projects_ensured');
    }).catch((err) => {
      logger.error('startup.workspace_projects_error', { error: err?.message });
    });
  } catch (err) {
    logger.error('startup.workspace_controller_import_error', { error: err?.message });
  }
});

function shutdown(signal) {
  logger.warn('shutdown.signal_received', { signal });

  server.close(async (err) => {
    if (err) {
      logger.error('shutdown.server_close_error', { error: err?.message });
      process.exit(1);
      return;
    }

    try {
      if (typeof prisma.disconnect === 'function') {
        await prisma.disconnect();
      }
    } catch (e) {
      logger.error('shutdown.db_close_error', { error: e?.message });
    }

    logger.info('shutdown.server_closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('shutdown.force_exit_timeout');
    process.exit(1);
  }, 15000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// L6 FIX: Exit on unhandled rejections (matches Node.js >=15 default behavior)
process.on('unhandledRejection', (reason, promise) => {
  // L5 FIX: Log full stack trace for debugging
  logger.error('process.unhandled_rejection', {
    reason: String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  setTimeout(() => process.exit(1), 1000).unref();
});

process.on('uncaughtException', (err) => {
  // L5 FIX: Log full stack trace for debugging
  logger.error('process.uncaught_exception', {
    error: err?.message,
    stack: err?.stack,
  });
  setTimeout(() => process.exit(1), 1000).unref();
});
