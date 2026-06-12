// reviewRoutes.js
const express = require('express');
const reviewRouter = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

reviewRouter.delete('/:productId/:reviewId', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
  product.calcAverageRating();
  await product.save();
  res.json({ success: true, message: 'Review deleted' });
}));

module.exports = reviewRouter;
