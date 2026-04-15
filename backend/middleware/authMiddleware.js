const { verifyToken } = require('../utils/jwt');
const prisma = require('../prisma');

const extractBearerToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
};

/**
 * Authentication middleware — validates JWT and attaches user to request.
 * Does NOT fall back to dev users; if DB is down, auth fails cleanly.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, college: true, year: true, role: true, emailVerified: true }
    });

    if (!user) {
      console.warn(`[authMiddleware] 401: User ${decoded.id} not found in DB`);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn(`[authMiddleware] 401: JWT Verification failed:`, error.message);
    // Covers: invalid token, expired token, wrong issuer/audience
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Optional authentication — sets req.user if valid token present,
 * but continues to next middleware regardless. Useful for public
 * endpoints that optionally personalize for logged-in users.
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
      console.warn(`[authMiddleware] optionalProtect: User ${decoded.id} not found`);
    }
  } catch (error) {
    console.warn(`[authMiddleware] optionalProtect: JWT Verfication failed:`, error.message);
    // Token invalid/expired — continue without user
  }

  next();
};

module.exports = { protect, optionalProtect };
