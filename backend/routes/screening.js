const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/rbacMiddleware');
const { validate } = require('../utils/validation');
const {
  submitScreening,
  getScreeningStatus,
  getScreeningSubmissions,
  reviewScreening,
} = require('../controllers/screeningController');

const router = express.Router();

// User-facing routes (authenticated)
router.post('/submit', protect, validate('submitScreening'), submitScreening);
router.get('/status', protect, getScreeningStatus);

// Admin routes (authenticated + admin-only)
router.get('/admin', protect, adminOnly, getScreeningSubmissions);
router.patch('/admin/:submissionId', protect, adminOnly, validate('reviewScreening'), reviewScreening);

module.exports = router;
