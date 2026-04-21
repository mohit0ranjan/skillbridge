/**
 * Database error detection utilities.
 * Extracted from devFallback.js so production code can safely import this
 * without pulling in dev-only mock data.
 */

function isDatabaseUnavailableError(error) {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase();
  return (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'P1001' ||
    error?.code === 'P1002' ||
    error?.code === 'P1008' ||
    error?.code === 'P1017' ||
    message.includes('connection refused') ||
    message.includes('database server') ||
    message.includes('timed out')
  );
}

module.exports = { isDatabaseUnavailableError };
