const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
  getWishlistCount,
} = require("../controllers/wishlistController");

// All protected - Specific routes first, then general
router.get("/count/total", protect, getWishlistCount);
router.get("/check/:productId", protect, checkWishlist);
router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

module.exports = router;
