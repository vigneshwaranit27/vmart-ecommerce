const asyncHandler = require('express-async-handler');
const { Cart } = require('../models/CategoryCart');
const Product = require('../models/Product');
const User = require('../models/User');

// ─── CART ───────────────────────────────────────────────

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price originalPrice images stock brand discount');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = Math.min(
      cart.items[itemIndex].quantity + quantity,
      product.stock
    );
  } else {
    cart.items.push({ product: productId, quantity, variant, price: product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name price originalPrice images stock brand');

  res.json({ success: true, cart, message: 'Added to cart' });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    item.remove();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name price originalPrice images stock brand');

  res.json({ success: true, cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate('items.product', 'name price originalPrice images stock brand');

  res.json({ success: true, cart, message: 'Item removed from cart' });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, couponDiscount: 0 });
  res.json({ success: true, message: 'Cart cleared' });
});

// ─── WISHLIST ───────────────────────────────────────────

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price originalPrice images ratings brand discount stock');

  res.json({ success: true, wishlist: user.wishlist });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(productId);
  let action;

  if (index > -1) {
    user.wishlist.splice(index, 1);
    action = 'removed';
  } else {
    user.wishlist.push(productId);
    action = 'added';
  }

  await user.save();
  res.json({ success: true, action, message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist` });
});

module.exports = {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  getWishlist, toggleWishlist
};
