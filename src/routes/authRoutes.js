const express = require('express');
const router = express.Router();
// We only need to destructure the functions once
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
// Define the registration route
router.post('/register', register);

// Define the login route
router.post('/login', login); 
router.get('/profile', protect, (req, res) => {
  res.json({
    message: "Welcome to your private profile!",
    user: req.user
  });
});

module.exports = router;