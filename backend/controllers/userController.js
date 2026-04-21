const prisma = require('../prisma');
const emailServiceModule = require('../services/email.service');
const emailService = emailServiceModule.emailService || emailServiceModule;
const { ApiResponse, ApiError, internalError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { isDatabaseUnavailableError } = require('../utils/dbErrors');
const { buildCurriculumTasks, groupTasksByWeek } = require('../utils/internshipCurriculum');

// C7 FIX: devFallback loaded conditionally
let devFallback = {};
if (process.env.NODE_ENV === 'development') {
  try { devFallback = require('../utils/devFallback'); } catch { /* not available */ }
}
const { buildFallbackDashboard } = devFallback;


/**
 * Enroll user in internship
 * Validates: internship exists, user not already enrolled
 * Sends confirmation email (non-blocking)
 */
const enroll = async (req, res, next) => {
  try {
    const { internshipId } = req.validatedBody;
    const userId = req.user.id;
    logger.info('users.enroll.start', { userId, internshipId });

    // Check internship exists
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId }
    });

    if (!internship) {
      return next(new ApiError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND'));
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.userInternship.findUnique({
      where: { userId_internshipId: { userId, internshipId } }
    });

    if (existingEnrollment) {
      logger.warn('users.enroll.already_enrolled', { userId, internshipId });
      return next(new ApiError('You are already enrolled in this internship', 400, 'ALREADY_ENROLLED'));
    }

    if ((internship.price || 0) > 0) {
      return next(new ApiError('Payment required before enrollment', 402, 'PAYMENT_REQUIRED', {
        internshipId: internship.id,
        amount: internship.price,
        currency: 'INR'
      }));
    }

    // Create enrollment
    const enrollment = await prisma.userInternship.create({
      data: {
        userId,
        internshipId,
        status: 'STARTED',
        progress: 0
      }
    });
    logger.info('users.enroll.persisted', { enrollmentId: enrollment.id, userId, internshipId });

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    // Send enrollment confirmation email (non-blocking)
    if (user) {
      emailService.sendEnrollmentConfirmation({
        userEmail: user.email,
        userName: user.name,
        internshipTitle: internship.title,
        internshipDuration: internship.duration || '12 weeks'
      }).then(() => logger.info('users.enroll.email_queued', { email: user.email }))
        .catch((err) => logger.error('users.enroll.email_failed', { email: user.email, errorMessage: err?.message }));
    }

    res.json(ApiResponse.success(
      {
        enrollmentId: enrollment.id,
        internship: {
          id: internship.id,
          title: internship.title,
          domain: internship.domain,
            duration: internship.duration,
            price: internship.price,
            requiresPayment: (internship.price || 0) > 0
        }
      },
      'Enrolled successfully! Check your email for details.',
      201
    ));
  } catch (error) {
    logger.error('users.enroll.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Enrollment failed', 'ENROLLMENT_FAILED', error));
  }
};


/**
 * Get user dashboard with enrollments, tasks, and progress
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info('users.dashboard.fetch', { userId });

    const [user, userInternships, finalSubmissions, certificates, taskSubmissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, college: true, year: true }
      }),
      prisma.userInternship.findMany({
        where: { userId },
        include: {
          internship: {
            include: { tasks: true }
          }
        }
      }),
      prisma.finalProjectSubmission.findMany({
        where: { userId }
      }),
      prisma.certificate.findMany({
        where: { userId }
      }),
      // I5 FIX: fetch real task submission status instead of hardcoding 'pending'
      prisma.submission.findMany({
        where: { userId },
        select: { taskId: true, status: true, feedback: true }
      })
    ]);

    if (!user) {
      return next(new ApiError('User not found', 404, 'USER_NOT_FOUND'));
    }

    // Process enrollments with progress
    const enrollments = userInternships.map(ui => {
      const sourceTasks = ui.internship.tasks.length > 0 ? ui.internship.tasks : buildCurriculumTasks(ui.internship);
      const weeks = groupTasksByWeek(sourceTasks);
      const totalWeeks = weeks.length;
      const submission = finalSubmissions.find(sub => sub.internshipId === ui.internshipId) || null;
      const progress = submission
        ? 100
        : totalWeeks === 0
          ? 0
          : Math.min(99, Math.round((ui.completedWeeks / totalWeeks) * 100));
      const certificate = certificates.find(c => c.internshipId === ui.internshipId);

      return {
        id: ui.id,
        internshipId: ui.internshipId,
        internship: ui.internship.title,
        domain: ui.internship.domain,
        duration: ui.internship.duration,
        status: ui.status,
        progress,
        totalWeeks,
        completedWeeks: ui.completedWeeks,
        tasksSummary: {
          total: totalWeeks,
          submitted: submission ? 1 : 0,
          approved: submission ? 1 : 0
        },
        tasks: sourceTasks.map((task, index) => {
          const sub = taskSubmissions.find((s) => s.taskId === task.id);
          return {
            id: task.id || `${ui.internshipId}-task-${index + 1}`,
            title: task.title,
            week: task.week,
            // I5 FIX: real submission status from DB, not hardcoded 'pending'
            status: sub?.status || 'PENDING',
            submissionStatus: sub?.status || null,
            feedback: sub?.feedback || null
          };
        }),
        weeks,
        finalSubmission: submission ? {
          id: submission.id,
          projectTitle: submission.projectTitle,
          projectLink: submission.projectLink,
          description: submission.description,
          fileUrl: submission.fileUrl,
          status: submission.status,
          submittedAt: submission.submittedAt
        } : null,
        certificate: certificate ? {
          id: certificate.id,
          certificateId: certificate.certificateId,
          isPaid: certificate.isPaid,
          issuedDate: certificate.issuedDate
        } : null,
        enrolledAt: ui.createdAt
      };
    });

    const recentFinalActivity = finalSubmissions.map((submission) => ({
      text: `Final project submitted: ${submission.projectTitle}`,
      time: submission.updatedAt,
      status: submission.status
    }));

    const recentCertificateActivity = certificates.map((certificate) => ({
      text: `Certificate issued: ${certificate.certificateId}`,
      time: certificate.issuedDate,
      status: 'APPROVED'
    }));

    const combinedActivity = [...recentFinalActivity, ...recentCertificateActivity]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    res.json(ApiResponse.success(
      {
        user,
        enrollments,
        stats: {
          totalEnrollments: enrollments.length,
          totalTasks: enrollments.reduce((sum, e) => sum + e.tasksSummary.total, 0),
          completedTasks: enrollments.reduce((sum, e) => sum + (e.finalSubmission ? 1 : 0), 0),
          certificates: certificates.filter(c => c.isPaid).length
        },
        recentActivity: combinedActivity
      },
      'Dashboard data retrieved successfully',
      200
    ));
  } catch (error) {
    if (isDatabaseUnavailableError(error) && process.env.NODE_ENV !== 'production') {
      const fallbackDashboard = buildFallbackDashboard(req.user.id);
      return res.json(ApiResponse.success(
        fallbackDashboard,
        'Dashboard data retrieved successfully',
        200
      ));
    }

    logger.error('users.dashboard.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Dashboard retrieval failed', 'DASHBOARD_FAILED', error));
  }
};

const getMyInternships = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.userInternship.findMany({
      where: { userId },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            domain: true,
            duration: true,
            level: true,
            price: true,
            description: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = enrollments.map((entry) => ({
      enrollmentId: entry.id,
      status: entry.status,
      progress: entry.progress,
      completedWeeks: entry.completedWeeks,
      enrolledAt: entry.createdAt,
      internship: entry.internship,
    }));

    res.json(ApiResponse.success(data, 'User internships retrieved successfully', 200));
  } catch (error) {
    logger.error('users.my_internships.error', { userId: req.user?.id, errorMessage: error?.message });
    next(internalError('Failed to fetch user internships', 'MY_INTERNSHIPS_FAILED', error));
  }
};

module.exports = { enroll, getDashboard, getMyInternships };
