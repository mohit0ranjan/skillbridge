/**
 * Centralized API Response Handler
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message = 'Error', statusCode = 400, errorCode = 'ERROR', details = null) {
    return {
      success: false,
      statusCode,
      message,
      errorCode,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(data, total, page, limit) {
    return {
      success: true,
      statusCode: 200,
      message: 'Success',
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

class ApiError extends Error {
  constructor(message, statusCode = 400, errorCode = 'ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Shared helper — builds a 500 ApiError.
 * In development the raw error message is included in details for easier debugging.
 * In production it is omitted to avoid leaking internals.
 *
 * @param {string} message   User-facing message
 * @param {string} errorCode Machine-readable code
 * @param {Error}  error     Original caught error
 * @param {object} [extra]   Optional additional details to merge in dev mode
 */
function internalError(message, errorCode, error, extra = null) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const devDetails = isDevelopment
    ? { ...(extra || {}), ...(error?.message ? { error: error.message } : {}) }
    : extra;
  return new ApiError(message, 500, errorCode, devDetails || null);
}

module.exports = { ApiResponse, ApiError, internalError };
