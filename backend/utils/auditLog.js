/**
 * Audit Log utility — records admin actions to the database.
 * Non-blocking: failures are logged but never break the calling request.
 */

const prisma = require('../prisma');
const logger = require('./logger');

/**
 * Record an admin action in the audit log.
 * @param {object} opts
 * @param {string} opts.adminId   — ID of the admin performing the action
 * @param {string} opts.action    — e.g. 'UPDATE_ROLE', 'REVIEW_SUBMISSION', 'SEND_EMAIL'
 * @param {string} opts.targetId  — ID of the affected resource
 * @param {object} [opts.metadata] — additional context (serialised as JSON)
 */
async function recordAudit({ adminId, action, targetId, metadata = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetId,
        metadata: metadata || undefined,
      },
    });
  } catch (error) {
    // Never let audit failures break the request
    logger.error('audit_log.write_failed', {
      adminId,
      action,
      targetId,
      errorMessage: error?.message,
    });
  }
}

module.exports = { recordAudit };
