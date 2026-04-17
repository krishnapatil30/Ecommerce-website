const prisma = require("../config/db");

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    console.log("❤️ ADD TO WISHLIST - Received:", { userId, productId });

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID required" });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });
    if (!product) {
      console.log("❌ Product not found:", { productId });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Add to wishlist
    const wishlist = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
      update: {},
      create: {
        userId,
        productId: parseInt(productId),
      },
    });

    console.log("✅ Added to wishlist:", {
      userId,
      productId,
      wishlistId: wishlist.id,
    });
    res.json({ success: true, message: "Added to wishlist", data: wishlist });
  } catch (error) {
    console.error("❌ Add to wishlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
    });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Not in wishlist" });
    }

    await prisma.wishlist.delete({ where: { id: wishlist.id } });
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 12, offset = 0 } = req.query;

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.wishlist.count({ where: { userId } });

    // Enrich with average ratings
    const enriched = wishlists.map((w) => ({
      ...w,
      product: {
        ...w.product,
        averageRating:
          w.product.reviews.length > 0
            ? (
                w.product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                w.product.reviews.length
              ).toFixed(1)
            : 0,
      },
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    console.log("🔍 CHECK WISHLIST - Checking:", { userId, productId });

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
    });

    const inWishlist = !!wishlist;
    console.log("✅ WISHLIST CHECK - Result:", {
      userId,
      productId,
      inWishlist,
    });
    res.json({ success: true, data: { inWishlist } });
  } catch (error) {
    console.error("❌ Check wishlist error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get wishlist count
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await prisma.wishlist.count({ where: { userId } });
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error("Wishlist count error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
