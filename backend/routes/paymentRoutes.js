// paymentRoutes.js
const express = require('express');
const payRouter = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, createStripeIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
payRouter.post('/razorpay/create-order', protect, createRazorpayOrder);
payRouter.post('/razorpay/verify', protect, verifyRazorpayPayment);
payRouter.post('/stripe/create-intent', protect, createStripeIntent);
module.exports = payRouter;
