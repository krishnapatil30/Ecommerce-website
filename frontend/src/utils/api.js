import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Your backend URL
});

// --- THE INTERCEPTOR ---
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ===== SEARCH API =====
export const searchProducts = (q, categoryId, minPrice, maxPrice, sortBy, limit = 12, offset = 0) =>
    api.get('/search/search', { params: { q, categoryId, minPrice, maxPrice, sortBy, limit, offset } });

export const getCategories = () => api.get('/search/categories');

export const getPriceRange = (categoryId) => api.get('/search/price-range', { params: { categoryId } });

// ===== REVIEW API =====
export const addReview = (productId, rating, text) =>
    api.post('/reviews', { productId, rating, text });

export const getProductReviews = (productId, limit = 10, offset = 0) =>
    api.get(`/reviews/${productId}`, { params: { limit, offset } });

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

// ===== WISHLIST API =====
export const addToWishlist = (productId) => api.post('/wishlist', { productId });

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

export const getWishlist = (limit = 12, offset = 0) =>
    api.get('/wishlist', { params: { limit, offset } });

export const checkWishlist = (productId) => api.get(`/wishlist/check/${productId}`);

export const getWishlistCount = () => api.get('/wishlist/count/total');

// ===== COUPON API =====
export const validateCoupon = (code, total) =>
    api.post('/coupons/validate', { code, total });

export const createCoupon = (code, discount, type, maxUses, expiresAt) =>
    api.post('/coupons', { code, discount, type, maxUses, expiresAt });

export const getAllCoupons = () => api.get('/coupons');

export const deleteCoupon = (couponId) => api.delete(`/coupons/${couponId}`);

// ===== PRODUCT IMAGES API =====
export const addProductImage = (productId, imageUrl, alt) =>
    api.post('/images', { productId, imageUrl, alt });

export const getProductImages = (productId) => api.get(`/images/${productId}`);

export const deleteProductImage = (imageId) => api.delete(`/images/${imageId}`);

export const reorderImages = (images) => api.put('/images/reorder', { images });

export default api;