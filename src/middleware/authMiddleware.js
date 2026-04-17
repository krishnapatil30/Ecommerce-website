const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in Headers (Authorization: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from string
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Force decoded.id to a Number to match your PostgreSQL 'int4' type
      req.user = await prisma.user.findUnique({
        where: { id: Number(decoded.id) }, 
        select: {
          id: true,
          email: true,
          role: true,
          name: true, 
        }
      });

      // CRITICAL: Check if user actually exists in DB
      if (!req.user) {
        return res.status(401).json({ message: 'User not found in database' });
      }

      return next();
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };