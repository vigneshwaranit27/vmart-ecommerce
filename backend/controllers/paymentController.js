const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const Razorpay = require('razorpay');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const { amount } = req.body;
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { userId: req.user._id.toString() }
  };

  const order = await razorpay.orders.create(options);
  res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  res.json({ success: true, message: 'Payment verified successfully', paymentId: razorpay_payment_id });
});

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create-intent
// @access  Private
const createStripeIntent = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'inr',
    metadata: { userId: req.user._id.toString() }
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent };
