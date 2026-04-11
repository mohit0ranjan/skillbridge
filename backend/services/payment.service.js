const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Verify Razorpay payment signature using timing-safe comparison.
 * Prevents timing side-channel attacks on signature forgery.
 */
const verifyPayment = (order_id, payment_id, signature) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return false;
  }

  if (!order_id || !payment_id || !signature) {
    return false;
  }

  const body = order_id + "|" + payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  // Timing-safe comparison to prevent side-channel attacks
  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
};

const fetchPaymentDetails = async (paymentId) => {
  if (!razorpayInstance || !paymentId) {
    return null;
  }

  return razorpayInstance.payments.fetch(paymentId);
};

const fetchOrderDetails = async (orderId) => {
  if (!razorpayInstance || !orderId) {
    return null;
  }

  return razorpayInstance.orders.fetch(orderId);
};

module.exports = {
  razorpay: razorpayInstance,
  verifyPayment,
  fetchPaymentDetails,
  fetchOrderDetails,
};
