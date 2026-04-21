const prisma = require('../prisma');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { isDatabaseUnavailableError } = require('../utils/dbErrors');

// C7 FIX: devFallback loaded conditionally
let devFallback = {};
if (process.env.NODE_ENV === 'development') {
  try { devFallback = require('../utils/devFallback'); } catch { /* not available */ }
}
const { getFallbackInternships, getFallbackInternshipById } = devFallback;

const isDevelopment = process.env.NODE_ENV === 'development';

function internalError(message, errorCode, error) {
  return new ApiError(
    message,
    500,
    errorCode,
    isDevelopment ? { error: error?.message } : null
  );
}

/**
 * Get all internships with pagination support
 */
const getAllInternships = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, domain, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filters
    const where = {};
    if (domain) {
      where.domain = { contains: domain, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.internship.count({ where });

    // Get paginated results
    const internships = await prisma.internship.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        tasks: { select: { id: true, title: true, week: true } }
      }
    });

    const data = internships.map((internship) => ({
      ...internship,
      requiresPayment: (internship.price || 0) > 0,
    }));

    res.json(ApiResponse.paginated(data, total, parseInt(page), parseInt(limit)));
  } catch (error) {
    if (isDatabaseUnavailableError(error) && process.env.NODE_ENV !== 'production') {
      const internships = getFallbackInternships();
      const filtered = internships.filter((internship) => {
        if (domain && !internship.domain.toLowerCase().includes(String(domain).toLowerCase())) {
          return false;
        }

        if (search) {
          const searchText = String(search).toLowerCase();
          const matchesTitle = internship.title.toLowerCase().includes(searchText);
          const matchesDescription = (internship.description || '').toLowerCase().includes(searchText);
          if (!matchesTitle && !matchesDescription) {
            return false;
          }
        }

        return true;
      });

      return res.json(ApiResponse.paginated(
        filtered.slice(skip, skip + parseInt(limit)),
        filtered.length,
        parseInt(page),
        parseInt(limit)
      ));
    }

    logger.error('internships.list.error', { errorMessage: error?.message });
    next(internalError('Failed to fetch internships', 'FETCH_FAILED', error));
  }
};

/**
 * Get internship by ID with all details
 */
const getInternshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            week: true,
          }
        }
      }
    });

    if (!internship) {
      return next(new ApiError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND'));
    }

    res.json(ApiResponse.success({
      ...internship,
      requiresPayment: (internship.price || 0) > 0,
    }, 'Internship retrieved successfully', 200));
  } catch (error) {
    if (isDatabaseUnavailableError(error) && process.env.NODE_ENV !== 'production') {
      const internship = getFallbackInternshipById(req.params.id);

      if (!internship) {
        return next(new ApiError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND'));
      }

      return res.json(ApiResponse.success(internship, 'Internship retrieved successfully', 200));
    }

    logger.error('internships.get_by_id.error', { internshipId: req.params?.id, errorMessage: error?.message });
    next(internalError('Failed to fetch internship', 'FETCH_FAILED', error));
  }
};

module.exports = { getAllInternships, getInternshipById };
