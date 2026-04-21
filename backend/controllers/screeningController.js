/**
 * Screening Pipeline Controller
 * Handles user screening test submissions, admin review, and selection flow.
 */

const prisma = require('../prisma');
const { ApiResponse, ApiError, internalError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { parsePagination, paginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/auditLog');

/**
 * Submit a screening test (user-facing).
 * POST /screening/submit
 */
const submitScreening = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { answers } = req.validatedBody;
    logger.info('screening.submit.start', { userId });

    // Check for existing submission
    const existing = await prisma.screeningSubmission.findFirst({
      where: { userId },
    });

    if (existing && ['SUBMITTED', 'UNDER_REVIEW', 'SELECTED'].includes(existing.status)) {
      return next(new ApiError(
        'You have already submitted a screening test',
        409,
        'SCREENING_ALREADY_SUBMITTED',
      ));
    }

    // Allow re-submission if previously rejected
    const submission = await prisma.screeningSubmission.upsert({
      where: { userId },
      create: {
        userId,
        answers,
        status: 'SUBMITTED',
      },
      update: {
        answers,
        status: 'SUBMITTED',
        score: null,
        feedback: null,
        reviewedBy: null,
      },
    });

    logger.info('screening.submit.persisted', { submissionId: submission.id, userId });

    res.status(201).json(ApiResponse.success(
      {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.createdAt,
      },
      'Screening test submitted successfully. You will be notified once reviewed.',
      201,
    ));
  } catch (error) {
    logger.error('screening.submit.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Failed to submit screening test', 'SCREENING_SUBMIT_FAILED', error));
  }
};

/**
 * Get user's own screening status.
 * GET /screening/status
 */
const getScreeningStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const submission = await prisma.screeningSubmission.findFirst({
      where: { userId },
      select: {
        id: true,
        status: true,
        score: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(ApiResponse.success(
      { submission },
      submission ? 'Screening status retrieved' : 'No screening submission found',
      200,
    ));
  } catch (error) {
    logger.error('screening.status.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Failed to fetch screening status', 'SCREENING_STATUS_FAILED', error));
  }
};

/**
 * Admin: List all screening submissions with filtering & pagination.
 * GET /admin/screening
 */
const getScreeningSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { skip, take, page, limit } = parsePagination(req);
    const where = {};

    if (status) {
      where.status = status;
    }

    const [submissions, total] = await Promise.all([
      prisma.screeningSubmission.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, college: true, year: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.screeningSubmission.count({ where }),
    ]);

    res.json(ApiResponse.success(
      paginatedResult(submissions, total, page, limit),
      'Screening submissions retrieved',
      200,
    ));
  } catch (error) {
    logger.error('screening.admin.list.error', { errorMessage: error?.message });
    next(internalError('Failed to fetch screening submissions', 'SCREENING_LIST_FAILED', error));
  }
};

/**
 * Admin: Review a screening submission (select/reject).
 * PATCH /admin/screening/:submissionId
 */
const reviewScreening = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { status, score, feedback } = req.validatedBody;
    const adminId = req.user.id;
    logger.info('screening.admin.review.start', { submissionId, status });

    const submission = await prisma.screeningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!submission) {
      return next(new ApiError('Screening submission not found', 404, 'SCREENING_NOT_FOUND'));
    }

    const updateData = {
      status,
      reviewedBy: adminId,
      ...(score !== undefined ? { score } : {}),
      ...(feedback ? { feedback } : {}),
    };

    const updated = await prisma.screeningSubmission.update({
      where: { id: submissionId },
      data: updateData,
    });

    // If selected, promote user role to INTERN and create workspace profile
    if (status === 'SELECTED') {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: submission.userId },
          data: { role: 'INTERN' },
        });

        // Create intern profile if it doesn't exist
        await tx.internProfile.upsert({
          where: { userId: submission.userId },
          create: { userId: submission.userId },
          update: {},
        });

        // Create workspace progress tracker
        await tx.workspaceProgress.upsert({
          where: { userId: submission.userId },
          create: { userId: submission.userId },
          update: {},
        });
      });

      logger.info('screening.admin.review.user_promoted', { userId: submission.userId });
    }

    // Record audit
    await recordAudit({
      adminId,
      action: `SCREENING_${status}`,
      targetId: submissionId,
      metadata: { userId: submission.userId, score, feedback },
    });

    logger.info('screening.admin.review.complete', { submissionId, status });

    res.json(ApiResponse.success(
      { submission: updated },
      `Screening submission ${status.toLowerCase()} successfully`,
      200,
    ));
  } catch (error) {
    logger.error('screening.admin.review.error', { submissionId: req.params?.submissionId, errorMessage: error?.message });
    next(internalError('Failed to review screening submission', 'SCREENING_REVIEW_FAILED', error));
  }
};

module.exports = {
  submitScreening,
  getScreeningStatus,
  getScreeningSubmissions,
  reviewScreening,
};
