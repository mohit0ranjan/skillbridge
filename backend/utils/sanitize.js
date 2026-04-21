/**
 * Input sanitization utilities.
 * Prevents XSS in dynamically injected email template parameters.
 */

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const ENTITY_RE = /[&<>"'`/]/g;

/**
 * Escape HTML entities in a string.
 * Safe for injection into HTML email templates.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(ENTITY_RE, (char) => ENTITY_MAP[char] || char);
}

/**
 * Deep-sanitize all string values in a plain object.
 * Non-string, non-object values pass through unchanged.
 */
function sanitizeParams(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = escapeHtml(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeParams(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

module.exports = { escapeHtml, sanitizeParams };
