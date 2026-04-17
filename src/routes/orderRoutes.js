const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');

router.post('/create', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/all-orders', protect, getAllOrders);

module.exports = router;