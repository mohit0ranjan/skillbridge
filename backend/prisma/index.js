const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Ensure DATABASE_URL is available even when this module is required from
// the root Next.js runtime (cwd != backend) or from bundled output.
if (!process.env.DATABASE_URL) {
  const envCandidates = [
    path.resolve(process.cwd(), 'backend', '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '..', '.env'),
  ];

  for (const envPath of envCandidates) {
    if (!fs.existsSync(envPath)) continue;

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }

    if (process.env.DATABASE_URL) break;
  }
}

// ---------------------------------------------------------------------------
// Singleton Prisma client – prevents multiple connection pools in
// serverless / container restarts (Azure App Service, Docker, etc.).
// ---------------------------------------------------------------------------

let prisma;

function buildClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.error('prisma.database_url_missing');
    return new PrismaClient();
  }

  return new PrismaClient();
}

// Lazily build once & cache
function getPrisma() {
  if (!prisma) {
    prisma = buildClient();
  }
  return prisma;
}

// Optional: test connectivity (called from app.js startup)
async function testConnection() {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    logger.info('prisma.connection_verified');
    return true;
  } catch (err) {
    logger.error('prisma.connection_failed', { errorMessage: err?.message });
    return false;
  }
}

// Graceful disconnect (used by shutdown handler)
async function disconnect() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Export a proxy so existing `require('../prisma')` usage keeps working
// as though `prisma` is a plain PrismaClient instance.
module.exports = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'testConnection') return testConnection;
    if (prop === 'disconnect') return disconnect;
    if (prop === 'then') return undefined; // avoid being treated as a thenable
    return getPrisma()[prop];
  },
});
