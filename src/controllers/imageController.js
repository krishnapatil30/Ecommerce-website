const prisma = require('../config/db');

// Add product image
exports.addProductImage = async (req, res) => {
  try {
    const { productId, imageUrl, alt } = req.body;

    if (!productId || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Product ID and image URL required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get max order
    const maxOrderImage = await prisma.productImage.findFirst({
      where: { productId: parseInt(productId) },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const image = await prisma.productImage.create({
      data: {
        productId: parseInt(productId),
        imageUrl,
        alt,
        order: (maxOrderImage?.order || 0) + 1
      }
    });

    res.json({ success: true, message: 'Image added', data: image });
  } catch (error) {
    console.error('Add image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get product images
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const images = await prisma.productImage.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await prisma.productImage.findUnique({ where: { id: parseInt(imageId) } });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await prisma.productImage.delete({ where: { id: parseInt(imageId) } });
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reorder images
exports.reorderImages = async (req, res) => {
  try {
    const { images } = req.body; // Array of { id, order }

    if (!Array.isArray(images)) {
      return res.status(400).json({ success: false, message: 'Images array required' });
    }

    // Update all images in parallel
    await Promise.all(
      images.map(img =>
        prisma.productImage.update({
          where: { id: parseInt(img.id) },
          data: { order: parseInt(img.order) }
        })
      )
    );

    res.json({ success: true, message: 'Images reordered' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
