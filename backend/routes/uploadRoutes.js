// uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadRouter = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

uploadRouter.post('/', protect, admin, upload.array('images', 10), (req, res) => {
  const urls = req.files.map(f => ({
    url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${f.filename}`,
    public_id: f.filename
  }));
  res.json({ success: true, images: urls });
});

module.exports = uploadRouter;
