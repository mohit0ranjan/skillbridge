const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'smtp_pass',
  'email_pass',
  'database_url',
  'jwt_secret',
  'razorpay_key_secret',
  'x-razorpay-signature',
];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function redactValue(key, value) {
  const normalizedKey = String(key || '').toLowerCase();
  if (SENSITIVE_KEYS.some((sensitive) => normalizedKey.includes(sensitive))) {
    return '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => (isObject(item) ? redactObject(item) : item));
  }

  if (isObject(value)) {
    return redactObject(value);
  }

  return value;
}

function redactObject(input) {
  const output = {};
  for (const [key, value] of Object.entries(input || {})) {
    output[key] = redactValue(key, value);
  }
  return output;
}

function emit(level, message, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...redactObject(meta),
  };

  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

module.exports = {
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};
