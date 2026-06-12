const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAllUsers, toggleUserStatus, getDashboardStats } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Admin
router.get('/', protect, admin, getAllUsers);
router.put('/:id/toggle-status', protect, admin, toggleUserStatus);
router.get('/admin/stats', protect, admin, getDashboardStats);

module.exports = router;
