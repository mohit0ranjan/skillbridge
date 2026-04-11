const crypto = require('crypto');
const prisma = require('../prisma');
const { razorpay, verifyPayment, fetchPaymentDetails, fetchOrderDetails } = require('../services/payment.service');
const { generateCertificateId } = require('../utils/generateCertificateId');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const emailServiceModule = require('../services/email.service');
const emailService = emailServiceModule.emailService || emailServiceModule;

const getWebhookBodyText = (body) => {
  if (Buffer.isBuffer(body)) {
    return body.toString('utf8');
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
};

const parseWebhookBody = (body) => {
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8'));
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return body;
};

const upsertEnrollmentForPayment = async (db, payment) => {
  if (!payment?.internshipId) {
    return null;
  }

  return db.userInternship.upsert({
    where: { userId_internshipId: { userId: payment.userId, internshipId: payment.internshipId } },
    update: {},
    create: {
      userId: payment.userId,
      internshipId: payment.internshipId,
      status: 'STARTED',
      progress: 0,
    }
  });
};

const reconcileSuccessfulPayment = async (payment, { notify = false } = {}) => {
  if (!payment?.internshipId) {
    return { enrollmentCreated: false, internshipData: payment?.internship || null };
  }

  const enrollment = await upsertEnrollmentForPayment(prisma, payment);

  const internshipData = payment.internship || (payment.certificate && payment.certificate.internship) || null;

  if (notify && payment.user && internshipData) {
    emailService.sendEnrollmentConfirmation({
      userEmail: payment.user.email,
      userName: payment.user.name,
      internshipTitle: internshipData.title,
      internshipDuration: internshipData.duration || '12 weeks'
    }).catch(err => console.error('Enrollment email failed:', err.message));
  }

  return { enrollment, internshipData };
};

const markPaymentFailedEndpoint = async (req, res, next) => {
  try {
    const { razorpay_order_id, paymentId, internshipId, reason } = req.validatedBody;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
        internshipId,
        razorpayOrderId: razorpay_order_id,
      }
    });

    if (!payment) {
      return next(new ApiError('Payment record not found for this user', 404, 'PAYMENT_NOT_FOUND'));
    }

    if (payment.status !== 'SUCCESS') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
    }

    res.json(ApiResponse.success(
      {
        paymentId: payment.id,
        status: payment.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        internshipId: payment.internshipId,
        reason: reason || null,
      },
      payment.status === 'SUCCESS' ? 'Payment already successful; failure report ignored' : 'Payment marked as failed',
      200
    ));
  } catch (error) {
    next(new ApiError(`Failed to mark payment status: ${error.message}`, 500, 'PAYMENT_STATUS_UPDATE_FAILED'));
  }
};

/**
 * Create Razorpay order with idempotency
 * Prevents duplicate charges by tracking idempotency keys
 * Links payment to certificate AND internship
 */
const createOrder = async (req, res, next) => {
  try {
    const { amount, internshipId } = req.validatedBody;
    const userId = req.user.id;

    if (!razorpay) {
      return next(new ApiError('Payment gateway not configured', 503, 'GATEWAY_DOWN'));
    }

    if (!internshipId) {
      return next(new ApiError('Internship ID is required for payment', 400, 'MISSING_INTERNSHIP_ID'));
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      select: { id: true, title: true, duration: true, price: true },
    });

    if (!internship) {
      return next(new ApiError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND'));
    }

    if ((internship.price || 0) <= 0) {
      return next(new ApiError('This internship does not require payment', 400, 'PAYMENT_NOT_REQUIRED'));
    }

    if (amount && Math.round(amount * 100) !== internship.price) {
      return next(new ApiError('Payment amount does not match internship price', 400, 'AMOUNT_MISMATCH', {
        expectedAmount: internship.price / 100,
      }));
    }

    const existingEnrollment = await prisma.userInternship.findUnique({
      where: { userId_internshipId: { userId, internshipId } }
    });

    if (existingEnrollment) {
      return next(new ApiError('You are already enrolled in this internship', 409, 'ALREADY_ENROLLED', {
        internshipId,
      }));
    }

    const existingSuccessfulPayment = await prisma.payment.findFirst({
      where: { userId, internshipId, status: 'SUCCESS' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        internship: { select: { title: true, duration: true } },
      }
    });

    if (existingSuccessfulPayment) {
      await reconcileSuccessfulPayment(existingSuccessfulPayment, { notify: false });

      return res.json(ApiResponse.success(
        {
          paymentId: existingSuccessfulPayment.id,
          internshipId,
          alreadyProcessed: true,
          accessGranted: true,
        },
        'Payment already processed for this internship',
        200
      ));
    }

    // Idempotency key: prevent duplicate orders for same request
    const idempotencyKey = `${userId}_${internshipId}_${internship.price}`;
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        internshipId,
        status: 'PENDING'
      }
    });

    if (existingPayment) {
      return res.json(ApiResponse.success(
        { orderId: existingPayment.razorpayOrderId, paymentId: existingPayment.id },
        'Order already created (idempotent)',
        200
      ));
    }

    const amountInPaise = internship.price;
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${userId.slice(0, 8)}`.substring(0, 40),
      notes: {
        userId,
        internshipId,
        internshipTitle: internship.title
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountInPaise,
        status: 'PENDING',
        razorpayOrderId: order.id,
        idempotencyKey,
        internshipId,
      }
    });

    res.json(ApiResponse.success(
      { orderId: order.id, paymentId: payment.id, amount },
      'Payment order created successfully',
      201
    ));
  } catch (error) {
    const detail = error?.error?.description || error.message;
    next(new ApiError(`Payment creation failed: ${detail}`, 500, 'ORDER_CREATION_FAILED', { razorpayError: detail }));
  }
};


/**
 * Verify payment signature and update payment status
 * Links payment to certificate AND sends confirmation email
 */
const verifyPaymentEndpoint = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, internshipId } = req.validatedBody;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
        internshipId,
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        certificate: { include: { internship: true } },
        internship: true
      }
    });

    if (!payment) {
      return next(new ApiError('Payment record not found for this user', 404, 'PAYMENT_NOT_FOUND'));
    }

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return next(new ApiError('Invalid payment signature', 400, 'INVALID_SIGNATURE'));
    }

    if (razorpay && process.env.NODE_ENV !== 'test') {
      const [paymentDetails, orderDetails] = await Promise.all([
        fetchPaymentDetails(razorpay_payment_id),
        fetchOrderDetails(razorpay_order_id),
      ]);

      if (!paymentDetails || !orderDetails) {
        return next(new ApiError('Unable to validate payment with gateway', 502, 'GATEWAY_VALIDATION_FAILED'));
      }

      if (paymentDetails.order_id !== razorpay_order_id || orderDetails.id !== razorpay_order_id) {
        return next(new ApiError('Gateway order mismatch detected', 400, 'ORDER_MISMATCH'));
      }

      if (paymentDetails.status !== 'captured') {
        return next(new ApiError('Payment is not captured yet', 409, 'PAYMENT_NOT_CAPTURED'));
      }

      if (paymentDetails.amount !== payment.amount || paymentDetails.currency !== payment.currency) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });
        return next(new ApiError('Payment amount/currency mismatch', 400, 'PAYMENT_MISMATCH'));
      }
    }

    const alreadySuccessful = payment.status === 'SUCCESS';

    // P1/P3 Fix: Prevent replay attacks and double-processing
    if (alreadySuccessful) {
      await reconcileSuccessfulPayment(payment, { notify: false });

      return res.json(ApiResponse.success(
        {
          paymentId: payment.id,
          status: 'SUCCESS',
          certificateId: payment.certificateId,
          internshipId: payment.internshipId
        },
        'Payment already verified',
        200
      ));
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          razorpayId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      });

      await upsertEnrollmentForPayment(tx, payment);
    });

    const refreshedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        certificate: { include: { internship: true } },
        internship: true
      }
    });

    await reconcileSuccessfulPayment(refreshedPayment || payment, { notify: true });

    // Send success emails and handle enrollment
    const emailPayment = refreshedPayment || payment;
    const internshipData = emailPayment.internship || (emailPayment.certificate && emailPayment.certificate.internship);
    if (emailPayment.user && internshipData) {
      // Send Payment Receipt email
      emailService.sendPaymentSuccess({
        userEmail: emailPayment.user.email,
        userName: emailPayment.user.name,
        internshipTitle: internshipData.title,
        amount: emailPayment.amount / 100 // convert from paise to rupees
      }).catch(err => console.error('Payment receipt email failed:', err.message));
    }

    res.json(ApiResponse.success(
      {
        paymentId: payment.id,
        status: 'SUCCESS',
        certificateId: payment.certificateId,
        internshipId: payment.internshipId
      },
      'Payment verified successfully',
      200
    ));
  } catch (error) {
    next(new ApiError(`Payment verification failed: ${error.message}`, 500, 'VERIFICATION_FAILED'));
  }
};


/**
 * Generate certificate after final project submission
 * Validates RBAC: user can only generate for own internships
 */
const generateCertificate = async (req, res, next) => {
  try {
    const { internshipId } = req.validatedBody;
    const userId = req.user.id;

    // Check internship exists
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { tasks: true }
    });

    if (!internship) {
      return next(new ApiError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND'));
    }

    // Verify user is enrolled in this internship
    const enrollment = await prisma.userInternship.findUnique({
      where: { userId_internshipId: { userId, internshipId } }
    });

    if (!enrollment) {
      return next(new ApiError('You are not enrolled in this internship', 403, 'NOT_ENROLLED'));
    }

    const finalSubmission = await prisma.finalProjectSubmission.findUnique({
      where: { userId_internshipId: { userId, internshipId } }
    });

    if (!finalSubmission) {
      return next(new ApiError('Submit your final project before generating your certificate', 402, 'SUBMISSION_REQUIRED'));
    }

    if (finalSubmission.status !== 'APPROVED') {
      return next(new ApiError('Final project must be approved before generating a certificate', 409, 'SUBMISSION_NOT_APPROVED'));
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({
      where: { userId_internshipId: { userId, internshipId } }
    });

    if (existing) {
      if (!existing.isPaid) {
        const unlocked = await prisma.certificate.update({
          where: { id: existing.id },
          data: { isPaid: true }
        });

        return res.json(ApiResponse.success(
          { certificate: unlocked },
          'Certificate already generated',
          200
        ));
      }

      return res.json(ApiResponse.success(
        { certificate: existing },
        'Certificate already generated',
        200
      ));
    }

    const certId = generateCertificateId();

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        internshipId,
        certificateId: certId,
        isPaid: true
      }
    });

    await prisma.userInternship.update({
      where: { userId_internshipId: { userId, internshipId } },
      data: { status: 'COMPLETED', progress: 100 }
    });

    // Alert User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && internship) {
      emailService.sendCertificateDelivery({
        userEmail: user.email,
        userName: user.name,
        internshipTitle: internship.title,
        certificateId: certId
      }).catch(err => console.error('Certificate email failed:', err.message));
    }

    res.json(ApiResponse.success(
      { certificate, certificateId: certId, submission: finalSubmission },
      'Certificate generated successfully',
      201
    ));
  } catch (error) {
    next(new ApiError(`Certificate generation failed: ${error.message}`, 500, 'GENERATION_FAILED'));
  }
};

/**
 * Generate Secure PDF Certificate
 * Publicly verifiable endpoint 
 */
const downloadPdf = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: { select: { name: true } },
        internship: { select: { title: true } }
      }
    });

    if (!certificate) {
      return next(new ApiError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND'));
    }

    const { generateCertificatePdf } = require('../utils/pdfGenerator');
    
    const pdfBuffer = await generateCertificatePdf({
      studentName: certificate.user.name,
      internship: certificate.internship.title,
      issueDate: certificate.issuedDate,
      certificateId: certificate.certificateId
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SkillBridge-Certificate-${certificate.certificateId}.pdf`);
    res.end(pdfBuffer);
  } catch (error) {
    next(new ApiError(`PDF generation failed: ${error.message}`, 500, 'PDF_FAILED'));
  }
};


/**
 * Download certificate (requires payment)
 * RBAC: Users can only download their own certificates
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, college: true } },
        internship: { select: { id: true, title: true, domain: true } }
      }
    });

    if (!certificate) {
      return next(new ApiError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND'));
    }

    // RBAC: Verify ownership
    if (certificate.userId !== userId && req.user.role !== 'ADMIN') {
      return next(new ApiError('Not authorized to access this certificate', 403, 'UNAUTHORIZED'));
    }

    // Verify payment
    if (!certificate.isPaid) {
      return next(new ApiError('Certificate payment required to unlock download', 402, 'PAYMENT_REQUIRED'));
    }

    res.json(ApiResponse.success(
      {
        certificateId: certificate.certificateId,
        studentName: certificate.user.name,
        college: certificate.user.college,
        program: certificate.internship.title,
        issuedDate: certificate.issuedDate,
        downloadUrl: `/api/certificates/${certificate.id}/pdf`
      },
      'Certificate data retrieved successfully',
      200
    ));
  } catch (error) {
    next(new ApiError(`Certificate download failed: ${error.message}`, 500, 'DOWNLOAD_FAILED'));
  }
};


/**
 * Verify certificate by public ID (no auth required)
 * Used for sharing/verification links
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return next(new ApiError('Certificate ID is required', 400, 'MISSING_ID'));
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: { select: { name: true, college: true } },
        internship: { select: { title: true, domain: true } }
      }
    });

    if (!certificate) {
      return res.json(ApiResponse.success({ valid: false }, 'Invalid Certificate ID', 200));
    }

    res.json(ApiResponse.success(
      {
        valid: true,
        studentName: certificate.user.name,
        college: certificate.user.college,
        internship: certificate.internship.title,
        domain: certificate.internship.domain,
        issueDate: certificate.issuedDate,
        certificateId: certificate.certificateId
      },
      'Certificate is valid',
      200
    ));
  } catch (error) {
    next(new ApiError(`Certificate verification failed: ${error.message}`, 500, 'VERIFICATION_FAILED'));
  }
};

/**
 * Fetch public certificate payload by certificateId.
 * Used by email deep links: /certificate/:id UI route.
 */
const getPublicCertificateById = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return next(new ApiError('Certificate ID is required', 400, 'MISSING_ID'));
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        user: { select: { name: true, college: true } },
        internship: { select: { title: true, domain: true } }
      }
    });

    if (!certificate) {
      return next(new ApiError('Certificate not found', 404, 'CERTIFICATE_NOT_FOUND'));
    }

    res.json(ApiResponse.success(
      {
        studentName: certificate.user.name,
        college: certificate.user.college,
        internship: certificate.internship.title,
        domain: certificate.internship.domain,
        issueDate: certificate.issuedDate,
        certificateId: certificate.certificateId,
      },
      'Certificate retrieved successfully',
      200
    ));
  } catch (error) {
    next(new ApiError(`Certificate retrieval failed: ${error.message}`, 500, 'CERTIFICATE_FETCH_FAILED'));
  }
};


/**
 * Razorpay webhook handler
 * Processes payment.captured events for async payment confirmation
 * Unlocks certificates when payment received
 */
const razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return next(new ApiError('Webhook not configured', 503, 'WEBHOOK_NOT_CONFIGURED'));
    }

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', secret);
    const body = getWebhookBodyText(req.body);
    shasum.update(body);
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.warn('Webhook signature mismatch', {
        expected: digest,
        received: req.headers['x-razorpay-signature']
      });
      return res.status(400).json(ApiResponse.error('Invalid webhook signature', 400, 'INVALID_SIGNATURE'));
    }

    const parsed = parseWebhookBody(req.body);
    const { event, payload } = parsed;

    if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (payment && payment.status !== 'SUCCESS') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });
      }
    }

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: {
          user: { select: { email: true, name: true } },
          internship: { select: { title: true, duration: true } },
          certificate: { include: { internship: true } }
        }
      });

      if (payment) {
        if (razorpay && process.env.NODE_ENV !== 'test') {
          const paymentDetails = await fetchPaymentDetails(paymentId);
          if (!paymentDetails || paymentDetails.status !== 'captured') {
            return res.status(400).json(ApiResponse.error('Webhook payment not captured', 400, 'INVALID_PAYMENT_STATE'));
          }

          if (paymentDetails.amount !== payment.amount || paymentDetails.currency !== payment.currency) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'FAILED' }
            });
            return res.status(400).json(ApiResponse.error('Webhook payment mismatch', 400, 'PAYMENT_MISMATCH'));
          }
        }

        const alreadySuccessful = payment.status === 'SUCCESS';

        if (!alreadySuccessful) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'SUCCESS',
                razorpayId: paymentId
              }
            });

            await upsertEnrollmentForPayment(tx, payment);
          });
        }

        await reconcileSuccessfulPayment(payment, { notify: !alreadySuccessful });

        if (!alreadySuccessful && payment.user) {
          const internshipData = payment.internship || (payment.certificate && payment.certificate.internship);

          if (internshipData) {
            // Send Payment Receipt email
            emailService.sendPaymentSuccess({
              userEmail: payment.user.email,
              userName: payment.user.name,
              internshipTitle: internshipData.title,
              amount: payment.amount / 100
            }).catch(err => console.error('Webhook payment email failed:', err.message));
          }
        }
      }
    }

    res.json(ApiResponse.success({}, 'Webhook processed successfully', 200));
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(new ApiError(`Webhook error: ${error.message}`, 500, 'WEBHOOK_ERROR'));
  }
};

module.exports = {
  createOrder,
  verifyPaymentEndpoint,
  markPaymentFailedEndpoint,
  generateCertificate,
  downloadCertificate,
  getPublicCertificateById,
  verifyCertificate,
  downloadPdf,
  razorpayWebhook
};
