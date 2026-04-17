const prisma = require('../config/db');

// Search products with filters
exports.searchProducts = async (req, res) => {
  try {
    const { q, categoryId, minPrice, maxPrice, sortBy, limit = 12, offset = 0 } = req.query;

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'popular') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
          category: true,
          reviews: { select: { rating: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings
    const enrichedProducts = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
        : 0
    }));

    res.json({
      success: true,
      data: enrichedProducts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get price range
exports.getPriceRange = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId: parseInt(categoryId) } : {};

    const [minProduct, maxProduct] = await Promise.all([
      prisma.product.findFirst({
        where,
        orderBy: { price: 'asc' },
        select: { price: true }
      }),
      prisma.product.findFirst({
        where,
        orderBy: { price: 'desc' },
        select: { price: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        min: minProduct?.price || 0,
        max: maxProduct?.price || 0
      }
    });
  } catch (error) {
    console.error('Price range error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
