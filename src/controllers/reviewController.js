const prisma = require('../config/db');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, text } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or rating (1-5)'
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: parseInt(productId),
          userId: userId
        }
      }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating: parseInt(rating), text }
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: parseInt(productId),
          userId,
          rating: parseInt(rating),
          text
        }
      });
    }

    res.json({ success: true, message: 'Review added successfully', data: review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.review.count({ where: { productId: parseInt(productId) } });
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId: parseInt(productId) },
      _count: true
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        total,
        average: parseFloat(avgRating),
        stats: Object.fromEntries(stats.map(s => [s.rating, s._count]))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id: parseInt(reviewId) } });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.review.delete({ where: { id: parseInt(reviewId) } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
