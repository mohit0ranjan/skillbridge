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
      select: { id: true, name: true, email: true, college: true, year: true, role: true, emailVerified: true }
    });

    if (!user) {
      logger.warn('auth.middleware.user_not_found', { userId: decoded.id });
      return res.status(401).json(ApiResponse.error('User not found', 401, 'USER_NOT_FOUND'));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('auth.middleware.jwt_verify_failed', { errorMessage: error?.message });
    return res.status(401).json(ApiResponse.error('Not authorized, token failed', 401, 'TOKEN_INVALID'));
  }
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
      select: { id: true, name: true, email: true, college: true, year: true, role: true, emailVerified: true }
    });

    if (user) {
      req.user = user;
    } else {
      logger.warn('auth.middleware.optional_user_not_found', { userId: decoded.id });
    }
  } catch (error) {
    logger.warn('auth.middleware.optional_jwt_verify_failed', { errorMessage: error?.message });
    // Token invalid/expired — continue without user
  }

  next();
};

module.exports = { protect, optionalProtect };
