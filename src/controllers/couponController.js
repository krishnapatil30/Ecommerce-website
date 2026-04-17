const prisma = require('../config/db');

// Validate and apply coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code || !total) {
      return res.status(400).json({ success: false, message: 'Code and total required' });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon expired' });
    }

    // Check usage limit
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon limit reached' });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (total * coupon.discount) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.discount;
    }

    const finalTotal = Math.max(0, total - discount);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount: parseFloat(discount.toFixed(2)),
        finalTotal: parseFloat(finalTotal.toFixed(2)),
        type: coupon.type
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount, type = 'percentage', maxUses, expiresAt } = req.body;

    if (!code || discount === undefined) {
      return res.status(400).json({ success: false, message: 'Code and discount required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id: parseInt(couponId) } });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await prisma.coupon.delete({ where: { id: parseInt(couponId) } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update coupon uses (called after successful order)
exports.incrementCouponUse = async (code) => {
  try {
    await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { currentUses: { increment: 1 } }
    });
  } catch (error) {
    console.error('Increment coupon error:', error);
  }
};
