const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { Cart } = require('../models/CategoryCart');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, pricing, couponCode, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product ${item.product} not found`);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentInfo: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
    pricing,
    couponCode,
    notes,
    trackingHistory: [{
      status: 'pending',
      message: 'Order placed successfully',
      timestamp: new Date()
    }]
  });

  // Reduce stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity }
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

  res.status(201).json({ success: true, order: populatedOrder });
});

// @desc    Get my orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user._id };
  if (status) query.orderStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    orders,
    pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.trackingHistory.push({
    status: 'cancelled',
    message: req.body.reason || 'Order cancelled by customer'
  });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity }
    });
  }

  await order.save();
  res.json({ success: true, message: 'Order cancelled successfully', order });
});

// ─── Admin ─────────────────────────────────────────────

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.orderStatus = status;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.json({ success: true, orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
  }

  order.trackingHistory.push({
    status,
    message: message || `Order status updated to ${status}`
  });

  await order.save();
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus };
