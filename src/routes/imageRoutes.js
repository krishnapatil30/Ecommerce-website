const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  addProductImage,
  getProductImages,
  deleteProductImage,
  reorderImages
} = require('../controllers/imageController');

// Public route
router.get('/:productId', getProductImages);

// Protected admin routes
router.post('/', protect, admin, addProductImage);
router.delete('/:imageId', protect, admin, deleteProductImage);
router.put('/reorder', protect, admin, reorderImages);

module.exports = router;
