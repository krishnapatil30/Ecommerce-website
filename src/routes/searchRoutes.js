const express = require('express');
const router = express.Router();
const { searchProducts, getCategories, getPriceRange } = require('../controllers/searchController');

// Public routes
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/price-range', getPriceRange);

module.exports = router;
