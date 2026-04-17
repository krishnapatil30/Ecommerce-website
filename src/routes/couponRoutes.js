const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  deleteCoupon
} = require('../controllers/couponController');

// Public route
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getAllCoupons);
router.delete('/:couponId', protect, admin, deleteCoupon);

module.exports = router;
