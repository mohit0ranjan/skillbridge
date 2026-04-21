const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/jwt');
const { sendWorkspaceCertificateEmail } = require('../services/workspaceCertificate.service');

const isDevelopment = process.env.NODE_ENV === 'development';

const DEFAULT_PROJECTS = [
  {
    title: 'Portfolio Landing Page',
    difficulty: 'EASY',
    description: 'Build and deploy a personal portfolio landing page with responsive sections and project highlights.',
  },
  {
    title: 'API Data Visualizer',
    difficulty: 'EASY',
    description: 'Fetch data from a public API and visualize insights using charts in a polished frontend app.',
  },
  {
    title: 'Auth-Enabled Task Tracker',
    difficulty: 'MEDIUM',
    description: 'Create a task tracker with authentication, protected routes, and CRUD operations.',
  },
  {
    title: 'Mini E-Commerce Backend',
    difficulty: 'MEDIUM',
    description: 'Develop a backend for products, carts, and orders with role-based access and validations.',
  },
  {
    title: 'Realtime Collaboration Board',
    difficulty: 'HARD',
    description: 'Implement a realtime project board with multi-user updates and conflict-safe state syncing.',
  },
  {
    title: 'ML Insights Web App',
    difficulty: 'HARD',
    description: 'Deliver an end-to-end app that serves ML predictions with explainable result summaries.',
  },
];

function internalError(message, errorCode, error) {
  return new ApiError(
    message,
    500,
    errorCode,
    isDevelopment ? { error: error?.message } : null,
  );
}

async function ensureWorkspaceProjects() {
  const count = await prisma.workspaceProject.count();
  if (count > 0) {
    return;
  }

  await prisma.workspaceProject.createMany({ data: DEFAULT_PROJECTS });
}

const createInternUser = async (req, res, next) => {
  try {
    const { name, email, password, internshipStart, internshipEnd } = req.validatedBody;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return next(new ApiError('Email already registered', 409, 'DUPLICATE_EMAIL'));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: 'INTERN',
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      await tx.internProfile.create({
        data: {
          userId: user.id,
          internshipStart: internshipStart ? new Date(internshipStart) : null,
          internshipEnd: internshipEnd ? new Date(internshipEnd) : null,
        },
      });

      await tx.workspaceProgress.create({
        data: {
          userId: user.id,
          week1: false,
          week2: false,
          week3: false,
          week4: false,
        },
      });

      return user;
    });

    return res.status(201).json(ApiResponse.success({ user: created }, 'Intern user created', 201));
  } catch (error) {
    logger.error('workspace.admin.create_user.error', { errorMessage: error?.message });
    return next(internalError('Failed to create intern user', 'WORKSPACE_CREATE_USER_FAILED', error));
  }
};

const getInterns = async (req, res, next) => {
  try {
    const interns = await prisma.user.findMany({
      where: { role: 'INTERN' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        internProfile: {
          select: {
            internshipStart: true,
            internshipEnd: true,
            selectedProjectId: true,
            selectedProject: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
        workspaceProgress: {
          select: {
            week1: true,
            week2: true,
            week3: true,
            week4: true,
          },
        },
        _count: {
          select: {
            workspaceSubmissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(ApiResponse.success({ interns }, 'Interns fetched successfully', 200));
  } catch (error) {
    logger.error('workspace.admin.interns.error', { errorMessage: error?.message });
    return next(internalError('Failed to fetch interns', 'WORKSPACE_FETCH_INTERNS_FAILED', error));
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.workspaceProject.findMany({
      orderBy: [
        { difficulty: 'asc' },
        { title: 'asc' },
      ],
    });

    return res.json(ApiResponse.success({ projects }, 'Workspace projects fetched', 200));
  } catch (error) {
    logger.error('workspace.projects.list.error', { errorMessage: error?.message });
    return next(internalError('Failed to fetch workspace projects', 'WORKSPACE_FETCH_PROJECTS_FAILED', error));
  }
};

const selectProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.validatedBody;

    const project = await prisma.workspaceProject.findUnique({ where: { id: projectId } });
    if (!project) {
      return next(new ApiError('Project not found', 404, 'WORKSPACE_PROJECT_NOT_FOUND'));
    }

    const profile = await prisma.internProfile.findUnique({ where: { userId } });
    if (profile?.selectedProjectId) {
      return next(new ApiError('Project already selected and locked', 409, 'WORKSPACE_PROJECT_LOCKED'));
    }

    const updatedProfile = await prisma.internProfile.upsert({
      where: { userId },
      create: {
        userId,
        selectedProjectId: projectId,
      },
      update: {
        selectedProjectId: projectId,
      },
      include: {
        selectedProject: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            description: true,
          },
        },
      },
    });

    await prisma.workspaceProgress.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return res.json(ApiResponse.success({ profile: updatedProfile }, 'Project selection saved', 200));
  } catch (error) {
    logger.error('workspace.project.select.error', { userId: req.user?.id, errorMessage: error?.message });
    return next(internalError('Failed to select project', 'WORKSPACE_SELECT_PROJECT_FAILED', error));
  }
};

const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [profile, progress] = await Promise.all([
      prisma.internProfile.findUnique({
        where: { userId },
        include: {
          selectedProject: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      }),
      prisma.workspaceProgress.upsert({ where: { userId }, create: { userId }, update: {} }),
    ]);

    return res.json(ApiResponse.success({ profile, progress }, 'Progress fetched successfully', 200));
  } catch (error) {
    logger.error('workspace.progress.get.error', { userId: req.user?.id, errorMessage: error?.message });
    return next(internalError('Failed to fetch progress', 'WORKSPACE_GET_PROGRESS_FAILED', error));
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { week, status } = req.validatedBody;

    const updateData = {};
    updateData[`week${week}`] = status;

    const progress = await prisma.workspaceProgress.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });

    return res.json(ApiResponse.success({ progress }, 'Progress updated', 200));
  } catch (error) {
    logger.error('workspace.progress.update.error', { userId: req.user?.id, errorMessage: error?.message });
    return next(internalError('Failed to update progress', 'WORKSPACE_UPDATE_PROGRESS_FAILED', error));
  }
};

const submitWorkspaceProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { githubLink } = req.validatedBody;

    const profile = await prisma.internProfile.findUnique({
      where: { userId },
      include: {
        selectedProject: true,
      },
    });

    if (!profile?.selectedProjectId || !profile.selectedProject) {
      return next(new ApiError('Select a project before submission', 409, 'WORKSPACE_PROJECT_NOT_SELECTED'));
    }

    const submission = await prisma.workspaceSubmission.create({
      data: {
        userId,
        projectId: profile.selectedProjectId,
        githubLink,
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    return res.status(201).json(ApiResponse.success({ submission }, 'Submission saved', 201));
  } catch (error) {
    logger.error('workspace.submit.error', { userId: req.user?.id, errorMessage: error?.message });
    return next(internalError('Failed to submit workspace project', 'WORKSPACE_SUBMIT_FAILED', error));
  }
};

const getSubmission = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const submission = await prisma.workspaceSubmission.findFirst({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(ApiResponse.success({ submission }, 'Submission fetched', 200));
  } catch (error) {
    logger.error('workspace.submission.get.error', { userId: req.user?.id, errorMessage: error?.message });
    return next(internalError('Failed to fetch submission', 'WORKSPACE_GET_SUBMISSION_FAILED', error));
  }
};

const reviewSubmission = async (req, res, next) => {
  try {
    const { submissionId, feedback } = req.validatedBody;
    const status = String(req.validatedBody.status || '').toUpperCase();

    const submission = await prisma.workspaceSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
    });

    if (!submission) {
      return next(new ApiError('Submission not found', 404, 'WORKSPACE_SUBMISSION_NOT_FOUND'));
    }

    const updatedSubmission = await prisma.workspaceSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        feedback: feedback || null,
      },
    });

    let certificate = null;

    if (status === 'APPROVED') {
      certificate = await sendWorkspaceCertificateEmail({
        userEmail: submission.user.email,
        userName: submission.user.name,
        projectTitle: submission.project.title,
      });
    }

    return res.json(ApiResponse.success(
      {
        submission: updatedSubmission,
        certificate,
      },
      `Submission ${status.toLowerCase()} successfully`,
      200,
    ));
  } catch (error) {
    logger.error('workspace.admin.review.error', { errorMessage: error?.message });
    return next(internalError('Failed to review submission', 'WORKSPACE_REVIEW_FAILED', error));
  }
};

/**
 * H2 FIX: Dedicated workspace login endpoint.
 * Validates credentials AND checks that the user has INTERN role.
 * Returns a workspace-scoped token.
 * POST /workspace/login
 */
const workspaceLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError('Email and password are required', 400, 'VALIDATION_ERROR'));
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        tokenVersion: true,
        internProfile: true,
      },
    });

    // Constant-time-safe: don't reveal whether email exists
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }

    // H2 FIX: Strict role check — workspace is INTERN-only
    if (user.role !== 'INTERN') {
      return next(new ApiError(
        'Workspace access requires intern status. Please complete the screening process first.',
        403,
        'NOT_AN_INTERN',
      ));
    }

    // Issue workspace-scoped token
    const token = generateToken(user.id, '7d', 'JWT_SECRET', 'workspace', user.tokenVersion || 0);

    logger.info('workspace.login.success', { userId: user.id });

    res.json(ApiResponse.success(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasProfile: !!user.internProfile,
        },
      },
      'Workspace login successful',
      200,
    ));
  } catch (error) {
    logger.error('workspace.login.error', { errorMessage: error?.message });
    next(internalError('Workspace login failed', 'WORKSPACE_LOGIN_FAILED', error));
  }
};

module.exports = {
  workspaceLogin,
  createInternUser,
  getInterns,
  getProjects,
  selectProject,
  getProgress,
  updateProgress,
  submitWorkspaceProject,
  getSubmission,
  reviewSubmission,
  ensureWorkspaceProjects,
};
