const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();
  res.json({ success: true, user, message: 'Profile updated successfully' });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses, message: 'Address added' });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  Object.assign(address, req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses, message: 'Address updated' });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses, message: 'Address deleted' });
});

// ─── Admin ──────────────────────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];
  if (role) query.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  res.json({ success: true, users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400); throw new Error('Cannot deactivate your own account');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, recentOrders, orderStats] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
    ])
  ]);

  const totalRevenue = orderStats.reduce((sum, s) =>
    ['delivered', 'shipped', 'out_for_delivery'].includes(s._id) ? sum + s.revenue : sum, 0);

  res.json({
    success: true,
    stats: { totalUsers, totalOrders, totalRevenue, orderStats, recentOrders }
  });
});

module.exports = {
  getProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  getAllUsers, toggleUserStatus, getDashboardStats
};
