const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// Add 'updateProduct' to the list below!
const { 
    createProduct, 
    getAllProducts, 
    getAllCategories, 
    deleteProduct, 
    getProductById,
    createCategory,
    updateProduct // <--- ADD THIS LINE
} = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getAllCategories);
router.get('/:id', getProductById);

// Protected routes
router.post('/create', protect, upload.single('image'), createProduct);
router.post('/categories', protect, createCategory); 

// This line will now work because 'updateProduct' is defined above
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;