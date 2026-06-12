const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Admin dashboard stats
router.get('/dashboard', protect, admin, asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, totalProducts, totalOrders,
    monthOrders, lastMonthOrders,
    recentOrders, topProducts, ordersByStatus
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
    ]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find({ isActive: true }).sort('-soldCount').limit(5).select('name price images soldCount ratings'),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }])
  ]);

  const thisMonth = monthOrders[0] || { count: 0, revenue: 0 };
  const lastMonth = lastMonthOrders[0] || { count: 0, revenue: 0 };

  const revenueGrowth = lastMonth.revenue
    ? (((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100).toFixed(1)
    : 100;

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      monthlyRevenue: thisMonth.revenue,
      monthlyOrders: thisMonth.count,
      revenueGrowth: parseFloat(revenueGrowth),
      recentOrders,
      topProducts,
      ordersByStatus
    }
  });
}));

// Revenue chart data (last 7 days)
router.get('/revenue-chart', protect, admin, asyncHandler(async (req, res) => {
  const days = 7;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } }
    ]);

    data.push({
      date: start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: result[0]?.revenue || 0,
      orders: result[0]?.orders || 0
    });
  }
  res.json({ success: true, data });
}));

module.exports = router;
