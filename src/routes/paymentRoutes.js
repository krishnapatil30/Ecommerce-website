const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRazorpayOrder } = require('../controllers/paymentController');

router.post('/create-order', protect, createRazorpayOrder);

module.exports = router;