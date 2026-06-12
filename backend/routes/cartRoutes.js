const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartWishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/item/:itemId', protect, updateCartItem);
router.delete('/item/:itemId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
