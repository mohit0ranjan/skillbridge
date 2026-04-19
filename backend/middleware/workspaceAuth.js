const { protect } = require('./authMiddleware');
const { ApiError } = require('../utils/apiResponse');

const normalizeRole = (role) => String(role || '').trim().toUpperCase();

const authenticateUser = protect;

const authorizeRole = (...roles) => {
  const allowed = new Set(roles.map((role) => normalizeRole(role)));

  return (req, res, next) => {
    const role = normalizeRole(req.user?.role);

    if (!req.user) {
      return next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    if (!allowed.has(role)) {
      return next(new ApiError('Forbidden: insufficient role', 403, 'FORBIDDEN'));
    }

    return next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRole,
};
