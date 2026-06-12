const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getRelatedProducts,
  addReview, getBrands,
  createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, addReview);

// Admin
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
