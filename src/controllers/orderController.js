const prisma = require("../config/db");

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      paymentId,
      shippingDetails,
      totalAmount,
      paymentMethod,
      status,
    } = req.body;
    const userId = req.user.id;

    console.log("📦 CREATE ORDER - Received Data:", {
      paymentId,
      shippingDetails,
      totalAmount,
      paymentMethod,
      status,
      itemsCount: items?.length,
    });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    // Calculate total and validate items
    let total = totalAmount || 0;
    const orderItems = [];

    if (!totalAmount) {
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }
        total += product.price * item.quantity;
      }
    }

    for (const item of items) {
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
      });
    }

    // Create order with payment info and shipping details
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        paymentId,
        paymentStatus: status === "PAID" ? "completed" : "pending",
        status: status === "PAID" ? "completed" : "pending",
        shippingPhone: shippingDetails?.phone,
        shippingAddress: shippingDetails?.address,
        shippingCity: shippingDetails?.city,
        shippingState: shippingDetails?.state,
        shippingZipCode: shippingDetails?.zipCode,
        paymentMethod: paymentMethod || "card",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    console.log("✅ ORDER CREATED - Shipping Details Saved:", {
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      state: order.shippingState,
      zipCode: order.shippingZipCode,
    });

    // Update stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("❌ ORDER CREATION ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      ...order,
      shippingDetails: {
        phone: order.shippingPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        zipCode: order.shippingZipCode,
      },
    }));

    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    console.log("🔍 getAllOrders - User:", req.user?.id, req.user?.role);

    // Admin endpoint: Get all orders with user and product info
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      ...order,
      shippingDetails: {
        phone: order.shippingPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        zipCode: order.shippingZipCode,
      },
    }));

    console.log("✅ getAllOrders - Found", orders.length, "orders");
    res.json(transformedOrders);
  } catch (error) {
    console.error("❌ getAllOrders Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
