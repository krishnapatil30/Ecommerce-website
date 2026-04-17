require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const imageRoutes = require('./routes/imageRoutes');
const prisma = require('./config/db'); // Needed for the debug route

const app = express();

// --- 🛠️ MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    next();
});

// --- 🛤️ ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/images', imageRoutes);

// 🔍 DIAGNOSTIC ROUTE: Visit http://localhost:5000/api/auth/debug-users
app.get('/api/auth/debug-users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, id: true } // Don't show passwords for safety
        });
        res.json({ 
            info: "These are the emails currently in your DB:",
            users 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: "Server is healthy!", timestamp: new Date() });
});

// --- 🚀 START SERVER ---
const PORT = process.env.PORT || 5000;

// Handle unhandled errors BEFORE starting server
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.error('Stack:', reason.stack);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});

// Graceful shutdown
let server;
process.on('SIGINT', () => {
    console.log('\n⚠️ Shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('🛑 Server closed');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

console.log('✅ Backend initialized successfully');
console.log(`📍 Starting server on port ${PORT}...`);

server = app.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🛠️ Diagnostic tool: http://localhost:${PORT}/api/auth/debug-users`);
    
    // Test database connection
    try {
        const testUser = await prisma.user.findFirst();
        console.log('✅ Database connection verified');
        console.log('🟢 Server is ready to accept requests');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});