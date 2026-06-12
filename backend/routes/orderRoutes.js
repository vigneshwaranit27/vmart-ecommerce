// ─── orderRoutes.js ─────────────────────────────────────
const express = require('express');
const orderRouter = express.Router();
const { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

orderRouter.post('/', protect, createOrder);
orderRouter.get('/my-orders', protect, getMyOrders);
orderRouter.get('/:id', protect, getOrder);
orderRouter.put('/:id/cancel', protect, cancelOrder);
orderRouter.get('/', protect, admin, getAllOrders);
orderRouter.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = orderRouter;
