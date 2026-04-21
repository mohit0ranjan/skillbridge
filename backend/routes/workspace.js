const express = require('express');
const { validate } = require('../utils/validation');
const {
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
} = require('../controllers/workspaceController');
const { authenticateUser, authorizeRole } = require('../middleware/workspaceAuth');

const router = express.Router();

// H2 FIX: Dedicated workspace login — no auth middleware (this IS the auth endpoint)
router.post('/login', workspaceLogin);

// All subsequent routes require authentication
router.use(authenticateUser);

router.get('/projects', authorizeRole('ADMIN', 'INTERN'), getProjects);
router.post('/select-project', authorizeRole('INTERN'), validate('workspaceSelectProject'), selectProject);
router.get('/progress', authorizeRole('INTERN'), getProgress);
router.post('/progress', authorizeRole('INTERN'), validate('workspaceUpdateProgress'), updateProgress);
router.post('/submit', authorizeRole('INTERN'), validate('workspaceSubmit'), submitWorkspaceProject);
router.get('/submission', authorizeRole('INTERN'), getSubmission);

router.post('/admin/create-user', authorizeRole('ADMIN'), validate('workspaceCreateUser'), createInternUser);
router.get('/admin/interns', authorizeRole('ADMIN'), getInterns);
router.post('/admin/review', authorizeRole('ADMIN'), validate('workspaceAdminReview'), reviewSubmission);

module.exports = router;
