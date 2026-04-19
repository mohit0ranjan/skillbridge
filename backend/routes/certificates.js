const express = require('express');
const { 
  createOrder, 
  verifyPaymentEndpoint, 
  refundPaymentEndpoint,
  markPaymentFailedEndpoint,
  generateCertificate, 
  downloadCertificate, 
  getPublicCertificateById,
  verifyCertificate,
  downloadPdf,
  razorpayWebhook 
} = require('../controllers/certificatesController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../utils/validation');

const router = express.Router();

// Protected routes with validation
router.post('/create-order', protect, validate('createOrder'), createOrder);
router.post('/verify-payment', protect, validate('verifyPayment'), verifyPaymentEndpoint);
router.post('/refund', protect, validate('refundPayment'), refundPaymentEndpoint);
router.post('/payment-failed', protect, validate('markPaymentFailed'), markPaymentFailedEndpoint);
router.post('/generate-certificate', protect, validate('generateCertificate'), generateCertificate);
router.get('/certificate/:id', protect, downloadCertificate);

// Public routes (no auth required)
// B7 FIX: removed erroneous /api prefix from sub-routes
// (router already mounted under /api/v1, so /api would produce /api/v1/api/...)
router.get('/public/certificate/:certificateId', getPublicCertificateById);
router.get('/public/certificate/:certificateId/pdf', downloadPdf);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/certificate/:certificateId/pdf', downloadPdf);
router.post('/razorpay-webhook', razorpayWebhook);

module.exports = router;
