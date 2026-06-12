const mongoose = require('mongoose');

// ─── Category ───────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  image: {
    public_id: String,
    url: { type: String, default: 'https://via.placeholder.com/300' }
  },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

// ─── Cart ────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  variant: {
    size: String,
    color: String
  },
  price: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  couponCode: String,
  couponDiscount: { type: Number, default: 0 }
}, { timestamps: true });

cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = { Category, Cart };
