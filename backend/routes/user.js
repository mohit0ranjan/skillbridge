const express = require('express');
const { enroll, getDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../utils/validation');

const router = express.Router();

router.post('/enroll', protect, validate('enroll'), enroll);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
