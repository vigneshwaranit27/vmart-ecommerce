// wishlistRoutes.js
const express = require('express');
const wishlistRouter = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/cartWishlistController');
const { protect } = require('../middleware/authMiddleware');
wishlistRouter.get('/', protect, getWishlist);
wishlistRouter.post('/toggle', protect, toggleWishlist);
module.exports = wishlistRouter;
