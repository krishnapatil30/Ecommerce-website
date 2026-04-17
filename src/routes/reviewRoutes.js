const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');

// Public route
router.get('/:productId', getProductReviews);

// Protected routes
router.post('/', protect, addReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
