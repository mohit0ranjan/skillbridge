const crypto = require('crypto');
const prisma = require('../prisma');
const paymentService = require('../services/payment.service');
const { generateCertificateId } = require('../utils/generateCertificateId');
const { ApiResponse, ApiError, internalError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
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

/**
 * Convert price to paise for Razorpay.
 * m4 FIX: Always multiply by 100 — all prices stored in rupees.
 * No heuristic guessing. DB stores rupees, gateway expects paise.
 */
const normalizePriceToPaise = (price) => {
  const numericPrice = Number(price || 0);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return 0;
  return Math.round(numericPrice * 100);
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
    }).catch((err) => logger.error('payments.enrollment_email_failed', { errorMessage: err?.message }));
  }

  return { enrollment, internshipData };
};

const markPaymentFailedEndpoint = async (req, res, next) => {
  try {
    const { razorpay_order_id, paymentId, internshipId, reason } = req.validatedBody;
    const userId = req.user.id;

    const paymentWhere = {
      id: paymentId,
      userId,
      razorpayOrderId: razorpay_order_id,
      ...(internshipId ? { internshipId } : {}),
    };

    const payment = await prisma.payment.findFirst({
      where: paymentWhere
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
    logger.error('payments.mark_failed.error', { errorMessage: error?.message });
    next(internalError('Failed to mark payment status', 'PAYMENT_STATUS_UPDATE_FAILED', error));
  }
};

/**
 * Create Razorpay order with idempotency
 * Prevents duplicate charges by tracking idempotency keys
 * Links payment to certificate AND internship
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      amount,
      internshipId,
      internshipTitle,
      internshipDomain,
      internshipDuration,
      internshipLevel,
      internshipDescription,
    } = req.validatedBody;
    const userId = req.user.id;
    logger.info('payments.create_order.start', { userId, internshipId: internshipId || null, amount });

    if (process.env.NODE_ENV !== 'production') {
      logger.info('payments.create_order.payload', {
        userId,
        internshipId: internshipId || null,
        internshipTitle: internshipTitle || null,
        amount,
      });
    }

    if (!paymentService.razorpay) {
      return next(new ApiError('Payment gateway not configured', 503, 'GATEWAY_DOWN'));
    }

    if (!internshipId && !internshipTitle) {
      return next(new ApiError('Internship information is required for payment', 400, 'MISSING_INTERNSHIP_INFO'));
    }

    let internship = null;

    if (internshipId) {
      internship = await prisma.internship.findUnique({
        where: { id: internshipId },
        select: { id: true, title: true, duration: true, level: true, domain: true, description: true, price: true },
      });

      if (!internship) {
        logger.info('payments.create_order.internship_id_lookup_miss', { internshipId });
      }
    }

    if (!internship && internshipTitle) {
      internship = await prisma.internship.findFirst({
        where: {
          title: { equals: internshipTitle, mode: 'insensitive' }
        },
        select: { id: true, title: true, duration: true, level: true, domain: true, description: true, price: true },
      });

      if (internship) {
        logger.info('payments.create_order.internship_resolved_by_title', { internshipId: internship.id, internshipTitle });
      }
    }

    // C2 FIX: Internship auto-creation from frontend metadata has been REMOVED.
    // All internships must exist in the database (seeded via admin or migration).
    // Accepting untrusted frontend data to create DB records was a security risk.

    if (!internship) {
      logger.warn('payments.create_order.internship_resolution_failed', { internshipId, internshipTitle });
      return next(new ApiError('Internship not found in database', 404, 'INTERNSHIP_NOT_FOUND'));
    }

    const resolvedInternshipId = internship.id;

    // B2/B6 FIX: prices are stored in rupees in DB; convert to paise for Razorpay.
    // REMOVED: the auto-update block that mutated internship.price in DB.
    // Price is authoritative as stored — if it needs correction, do it via admin/seed.
    const normalizedInternshipPrice = normalizePriceToPaise(internship.price);

    if (normalizedInternshipPrice <= 0) {
      return next(new ApiError('This internship does not require payment', 400, 'PAYMENT_NOT_REQUIRED'));
    }

    // Validate frontend-sent amount matches DB price. Fail fast.
    if (amount && Math.round(amount * 100) !== normalizedInternshipPrice) {
      return next(new ApiError('Payment amount does not match internship price', 400, 'AMOUNT_MISMATCH', {
        expectedAmount: normalizedInternshipPrice / 100,
      }));
    }

    const existingEnrollment = await prisma.userInternship.findUnique({
      where: { userId_internshipId: { userId, internshipId: resolvedInternshipId } }
    });

    if (existingEnrollment) {
      return next(new ApiError('You are already enrolled in this internship', 409, 'ALREADY_ENROLLED', {
        internshipId: resolvedInternshipId,
      }));
    }

    const existingSuccessfulPayment = await prisma.payment.findFirst({
      where: { userId, internshipId: resolvedInternshipId, status: 'SUCCESS' },
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
          internshipId: resolvedInternshipId,
          alreadyProcessed: true,
          accessGranted: true,
        },
        'Payment already processed for this internship',
        200
      ));
    }

    // Idempotency key: prevent duplicate orders for same request
    const idempotencyKey = `${userId}_${resolvedInternshipId}_${normalizedInternshipPrice}`;
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        internshipId: resolvedInternshipId,
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

    // Clean up old failed payments to allow retry
    // This prevents unique constraint violations on idempotencyKey
    await prisma.payment.deleteMany({
      where: {
        userId,
        internshipId: resolvedInternshipId,
        status: 'FAILED'
      }
    });

    const amountInPaise = normalizedInternshipPrice;
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${userId.slice(0, 8)}`.substring(0, 40),
      notes: {
        userId,
        internshipId: resolvedInternshipId,
        internshipTitle: Buffer.from((internship.title || '').substring(0, 200), 'utf8').toString('utf8').replace(/[^\x20-\x7F]/g, '')
      }
    };

    const order = await paymentService.razorpay.orders.create(options);

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountInPaise,
        status: 'PENDING',
        razorpayOrderId: order.id,
        idempotencyKey,
        internshipId: resolvedInternshipId,
      }
    });
    logger.info('payments.create_order.persisted', { paymentId: payment.id, orderId: order.id });

    res.json(ApiResponse.success(
      { orderId: order.id, paymentId: payment.id, amount: amountInPaise / 100, internshipId: resolvedInternshipId },
      'Payment order created successfully',
      201
    ));
  } catch (error) {
    const detail = error?.error?.description || error?.message;
    logger.error('payments.create_order.error', { errorMessage: error?.message, razorpayError: detail });
    next(internalError('Payment creation failed', 'ORDER_CREATION_FAILED', error, detail ? { razorpayError: detail } : null));
  }
};


/**
 * Verify payment signature and update payment status
 * Links payment to certificate AND sends confirmation email
 */
const verifyPaymentEndpoint = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, internshipId } = req.validatedBody;
    const userId = req.user?.id || null;
    logger.info('payments.verify.start', { paymentId, orderId: razorpay_order_id });

    const paymentWhere = {
      id: paymentId,
      razorpayOrderId: razorpay_order_id,
      ...(internshipId ? { internshipId } : {}),
      ...(userId ? { userId } : {}),
    };

    const payment = await prisma.payment.findFirst({
      where: paymentWhere,
      include: {
        user: { select: { id: true, name: true, email: true } },
        certificate: { include: { internship: true } },
        internship: true
      }
    });

    if (!payment) {
      return next(new ApiError('Payment record not found for this user', 404, 'PAYMENT_NOT_FOUND'));
    }

    const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return next(new ApiError('Invalid payment signature', 400, 'INVALID_SIGNATURE'));
    }

    if (paymentService.razorpay && process.env.NODE_ENV !== 'test') {
      const [paymentDetails, orderDetails] = await Promise.all([
        paymentService.fetchPaymentDetails(razorpay_payment_id),
        paymentService.fetchOrderDetails(razorpay_order_id),
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
    logger.info('payments.verify.marked_success', { paymentId: payment.id });

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
      }).then(() => logger.info('payments.verify.receipt_email_queued', { email: emailPayment.user.email }))
        .catch((err) => logger.error('payments.verify.receipt_email_failed', { errorMessage: err?.message }));
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
    logger.error('payments.verify.error', { errorMessage: error?.message });
    next(internalError('Payment verification failed', 'VERIFICATION_FAILED', error));
  }
};

/**
 * Initiate Razorpay refund for a successful captured payment.
 * Only owner of the payment can request refund via API.
 */
const refundPaymentEndpoint = async (req, res, next) => {
  try {
    const { paymentId, amount, reason } = req.validatedBody;
    const userId = req.user.id;
    logger.info('payments.refund.start', { paymentId, userId });

    if (!paymentService.razorpay) {
      return next(new ApiError('Payment gateway not configured', 503, 'GATEWAY_DOWN'));
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
        status: 'SUCCESS',
      }
    });

    if (!payment) {
      return next(new ApiError('Successful payment record not found for this user', 404, 'PAYMENT_NOT_FOUND'));
    }

    if (!payment.razorpayId) {
      return next(new ApiError('Payment is not captured yet', 409, 'PAYMENT_NOT_CAPTURED'));
    }

    const refundPayload = {
      ...(amount ? { amount } : {}),
      ...(reason ? { notes: { reason: String(reason).slice(0, 256) } } : {})
    };

    const refund = await paymentService.createRefund(payment.razorpayId, refundPayload);

    if (!refund) {
      return next(new ApiError('Unable to initiate refund', 502, 'REFUND_FAILED'));
    }

    return res.json(ApiResponse.success(
      {
        paymentId: payment.id,
        razorpayPaymentId: payment.razorpayId,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        speedProcessed: refund.speed_processed,
      },
      'Refund initiated successfully',
      200
    ));
  } catch (error) {
    logger.error('payments.refund.error', { paymentId: req.validatedBody?.paymentId, errorMessage: error?.message });
    return next(internalError('Refund failed', 'REFUND_FAILED', error));
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
    logger.info('certificates.generate.start', { userId, internshipId });

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
    logger.info('certificates.generate.persisted', { certificateId: certId });

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
      }).then(() => logger.info('certificates.generate.email_queued', { email: user.email }))
        .catch((err) => logger.error('certificates.generate.email_failed', { errorMessage: err?.message }));
    }

    res.json(ApiResponse.success(
      { certificate, certificateId: certId, submission: finalSubmission },
      'Certificate generated successfully',
      201
    ));
  } catch (error) {
    logger.error('certificates.generate.error', { errorMessage: error?.message });
    next(internalError('Certificate generation failed', 'GENERATION_FAILED', error));
  }
};

/**
 * Legacy PDF endpoint (deprecated)
 * Redirects to the unified frontend certificate view so preview/download share one source.
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

    const frontendBase = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
    const certificatePath = `/certificate/${encodeURIComponent(certificate.certificateId)}`;
    const redirectUrl = frontendBase ? `${frontendBase}${certificatePath}` : certificatePath;

    return res.redirect(302, redirectUrl);
  } catch (error) {
    logger.error('certificates.redirect.error', { certificateId: req.params?.certificateId, errorMessage: error?.message });
    next(internalError('Certificate redirect failed', 'REDIRECT_FAILED', error));
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
        downloadUrl: `/certificate/${certificate.certificateId}`
      },
      'Certificate data retrieved successfully',
      200
    ));
  } catch (error) {
    logger.error('certificates.download.error', { certificateId: req.params?.id, errorMessage: error?.message });
    next(internalError('Certificate download failed', 'DOWNLOAD_FAILED', error));
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
        internship: { select: { title: true, domain: true, duration: true } }
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
    logger.error('certificates.verify.error', { certificateId: req.params?.certificateId, errorMessage: error?.message });
    next(internalError('Certificate verification failed', 'VERIFICATION_FAILED', error));
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
        duration: certificate.internship.duration || '4 Weeks',
        issueDate: certificate.issuedDate,
        certificateId: certificate.certificateId,
      },
      'Certificate retrieved successfully',
      200
    ));
  } catch (error) {
    logger.error('certificates.public_fetch.error', { certificateId: req.params?.certificateId, errorMessage: error?.message });
    next(internalError('Certificate retrieval failed', 'CERTIFICATE_FETCH_FAILED', error));
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
      logger.error('payments.webhook.secret_missing');
      return next(new ApiError('Webhook not configured', 503, 'WEBHOOK_NOT_CONFIGURED'));
    }

    // Verify webhook signature
    const receivedSignature = String(req.headers['x-razorpay-signature'] || '').trim();
    if (!receivedSignature) {
      return res.status(400).json(ApiResponse.error('Missing webhook signature', 400, 'MISSING_SIGNATURE'));
    }

    const shasum = crypto.createHmac('sha256', secret);
    const body = getWebhookBodyText(req.body);
    shasum.update(body);
    const digest = shasum.digest('hex');

    let signatureValid = false;
    try {
      const expectedBuffer = Buffer.from(digest, 'hex');
      const receivedBuffer = Buffer.from(receivedSignature, 'hex');
      signatureValid = expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      signatureValid = false;
    }

    if (!signatureValid) {
      logger.warn('payments.webhook.signature_mismatch', {
        received: receivedSignature
      });
      return res.status(400).json(ApiResponse.error('Invalid webhook signature', 400, 'INVALID_SIGNATURE'));
    }

    const parsed = parseWebhookBody(req.body);
    const { event, payload } = parsed;
    logger.info('payments.webhook.received', { event });

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
        if (paymentService.razorpay && process.env.NODE_ENV !== 'test') {
          const paymentDetails = await paymentService.fetchPaymentDetails(paymentId);
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
        logger.info('payments.webhook.payment_processed', { orderId, paymentId, alreadySuccessful });

        if (!alreadySuccessful && payment.user) {
          const internshipData = payment.internship || (payment.certificate && payment.certificate.internship);

          if (internshipData) {
            // Send Payment Receipt email
            emailService.sendPaymentSuccess({
              userEmail: payment.user.email,
              userName: payment.user.name,
              internshipTitle: internshipData.title,
              amount: payment.amount / 100
            }).then(() => logger.info('payments.webhook.receipt_email_queued', { orderId, paymentId }))
              .catch((err) => logger.error('payments.webhook.receipt_email_failed', { errorMessage: err?.message }));
          }
        }
      }
    }

    res.json(ApiResponse.success({}, 'Webhook processed successfully', 200));
  } catch (error) {
    logger.error('payments.webhook.error', { errorMessage: error?.message });
    next(internalError('Webhook error', 'WEBHOOK_ERROR', error));
  }
};

module.exports = {
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
};
