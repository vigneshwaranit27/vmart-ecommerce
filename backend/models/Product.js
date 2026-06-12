const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorHex: String,
  stock: { type: Number, default: 0 },
  price: Number,
  sku: String
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: { type: String, maxlength: 500 },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: { type: String },
  brand: { type: String, required: true },
  images: [{
    public_id: String,
    url: { type: String, required: true },
    alt: String
  }],
  variants: [variantSchema],
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: { type: String, unique: true, sparse: true },
  tags: [String],
  features: [String],
  specifications: [{
    key: String,
    value: String
  }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [reviewSchema],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isNew: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  freeShipping: { type: Boolean, default: false },
  shippingCharge: { type: Number, default: 0 },
  returnPolicy: { type: String, default: '30 days return policy' },
  warranty: { type: String, default: '1 year warranty' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  // Calculate discount
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Calculate average rating
productSchema.methods.calcAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings.average = Math.round((sum / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ price: 1, 'ratings.average': -1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
