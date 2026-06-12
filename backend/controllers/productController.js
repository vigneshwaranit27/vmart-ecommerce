const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, sort = '-createdAt',
    search, category, brand, minPrice, maxPrice,
    rating, inStock, isFeatured, isNew, isBestSeller,
    freeShipping
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (category) query.category = category;
  if (brand) query.brand = { $in: brand.split(',') };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query['ratings.average'] = { $gte: Number(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (isFeatured === 'true') query.isFeatured = true;
  if (isNew === 'true') query.isNew = true;
  if (isBestSeller === 'true') query.isBestSeller = true;
  if (freeShipping === 'true') query.freeShipping = true;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isActive: true
  })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  res.json({ success: true, product });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true
  })
    .limit(8)
    .select('name price originalPrice images ratings brand discount')
    .lean();

  res.json({ success: true, products: related });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar?.url,
    rating: Number(rating),
    title,
    comment
  });

  product.calcAverageRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added successfully' });
});

// @desc    Get brands list
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  res.json({ success: true, brands });
});

// ─── Admin Controllers ──────────────────────────────────

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product deleted successfully' });
});

module.exports = {
  getProducts, getProduct, getRelatedProducts,
  addReview, getBrands,
  createProduct, updateProduct, deleteProduct
};
