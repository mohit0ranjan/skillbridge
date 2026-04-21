const { verifyToken } = require('../utils/jwt');
const prisma = require('../prisma');
const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');

const extractBearerToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
};

/**
 * Authentication middleware — validates JWT and attaches user to request.
 * B3 FIX: responses now use ApiResponse envelope for consistency.
 * C3 FIX: validates tokenVersion to support server-side revocation.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return res.status(401).json(ApiResponse.error('Not authorized, no token', 401, 'NO_TOKEN'));
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, college: true, year: true, role: true, emailVerified: true, tokenVersion: true }
    });

    if (!user) {
      logger.warn('auth.middleware.user_not_found', { userId: decoded.id });
      return res.status(401).json(ApiResponse.error('User not found', 401, 'USER_NOT_FOUND'));
    }

    // C3 FIX: Reject tokens issued before the latest tokenVersion
    if (decoded.tv !== undefined && decoded.tv !== user.tokenVersion) {
      logger.warn('auth.middleware.token_version_mismatch', { userId: decoded.id, tokenTv: decoded.tv, dbTv: user.tokenVersion });
      return res.status(401).json(ApiResponse.error('Session invalidated. Please login again.', 401, 'TOKEN_REVOKED'));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('auth.middleware.jwt_verify_failed', { errorMessage: error?.message });
    return res.status(401).json(ApiResponse.error('Not authorized, token failed', 401, 'TOKEN_INVALID'));
  }
};

/**
 * M3 FIX: Middleware that enforces email verification.
 * Apply after `protect` on routes where verified email is required.
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.emailVerified) {
    return res.status(403).json(ApiResponse.error('Email verification required', 403, 'EMAIL_NOT_VERIFIED'));
  }
  next();
};

/**
 * Optional authentication — sets req.user if valid token present,
 * but continues to next middleware regardless.
 */
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, college: true, year: true, role: true, emailVerified: true, tokenVersion: true }
    });

    if (user && (decoded.tv === undefined || decoded.tv === user.tokenVersion)) {
      req.user = user;
    } else {
      logger.warn('auth.middleware.optional_user_not_found_or_revoked', { userId: decoded.id });
    }
  } catch (error) {
    logger.warn('auth.middleware.optional_jwt_verify_failed', { errorMessage: error?.message });
    // Token invalid/expired — continue without user
  }

  next();
};

module.exports = { protect, optionalProtect, requireVerifiedEmail };

