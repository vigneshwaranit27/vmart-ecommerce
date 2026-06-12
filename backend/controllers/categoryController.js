const asyncHandler = require('express-async-handler');
const { Category } = require('../models/CategoryCart');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .sort('sortOrder name').lean();
  res.json({ success: true, categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true
  });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
