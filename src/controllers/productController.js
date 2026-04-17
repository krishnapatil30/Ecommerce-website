const prisma = require('../config/db');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. CREATE PRODUCT (POST)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    console.log('📝 Creating product:', { name, price, categoryId, hasFile: !!req.file });

    // Validation Check
    if (!name || price === '' || price === undefined || !categoryId) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: "Missing fields! Name, Price, and Category ID are required." 
      });
    }

    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: "Please upload an image." });
    }

    // Parse price and stock with defaults
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock) || 0;
    const parsedCategoryId = parseInt(categoryId);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.error('❌ Invalid price:', price);
      return res.status(400).json({ error: "Price must be a valid positive number." });
    }

    console.log('✅ Validation passed:', { parsedPrice, parsedStock, parsedCategoryId });

    // Upload image to Cloudinary
    console.log('📤 Uploading image to Cloudinary...');
    
    let imageUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`; // Default placeholder
    
    try {
      // Upload to Cloudinary using buffer
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecommerce-products',
            resource_type: 'auto',
            public_id: `product-${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      if (uploadResult && uploadResult.secure_url) {
        imageUrl = uploadResult.secure_url;
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } else {
        console.warn('⚠️ Cloudinary upload returned no URL (using placeholder)');
      }
    } catch (uploadError) {
      console.warn('⚠️ Cloudinary upload failed (using placeholder):', uploadError.message);
      // Continue with placeholder image
    }

    // Fix: Prisma model names are usually lowercase in the client
    const ProductModel = prisma.product;
    
    if (!ProductModel) {
        console.error('❌ Product model not found in Prisma');
        return res.status(500).json({ error: "Database model 'product' not found in Prisma." });
    }

    // Data Parsing & Database Action
    console.log('📊 About to create product with:', {
      name: String(name),
      description: String(description || ""),
      price: parsedPrice,
      stock: parsedStock,
      imageUrl: imageUrl,
      categoryId: parsedCategoryId
    });

    // Ensure all values are properly typed
    const createData = {
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(parsedPrice),
      stock: Number(parsedStock),
      imageUrl: imageUrl || "https://via.placeholder.com/300x300?text=Product",
      categoryId: Number(parsedCategoryId)
    };

    console.log('🔍 Final data to send to Prisma:', createData);
    console.log('🔍 Data types:', {
      name: typeof createData.name,
      price: typeof createData.price,
      stock: typeof createData.stock,
      categoryId: typeof createData.categoryId,
      imageUrl: typeof createData.imageUrl
    });

    const product = await prisma.product.create({
      data: createData,
      include: { category: true }
    });

    console.log("✅ Product Created successfully!", product.id);
    res.status(201).json({ message: "Success! 🚀", product });

  } catch (error) {
    // FIX: Detailed logging for CREATE specifically
    console.error("--- ❌ CREATE ERROR DETAILS ---", error.message);
    console.error("Error code:", error.code);
    
    // Check if error is due to missing Category
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Category ID not found. Please check your categories." });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// 2. GET ALL PRODUCTS (GET)
const getAllProducts = async (req, res) => {
  try {
    console.log('🔍 getAllProducts called');
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log('✅ getAllProducts - Found', products.length, 'products');
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ getAllProducts Error:', error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// 3. GET ALL CATEGORIES (GET)
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// 3. DELETE PRODUCT (DELETE)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Product deleted successfully! 🗑️" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete product. It might not exist." });
  }
};
 
// 4. GET SINGLE PRODUCT (GET)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard against non-numeric IDs
    if (isNaN(parseInt(id))) {
       return res.status(400).json({ error: "Invalid Product ID format." });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found in the elite collection." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("--- ❌ GET BY ID ERROR ---", error); 
    res.status(500).json({ error: error.message });
  }
};

// 5. CREATE CATEGORY (POST)
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }

    // Check if category already exists to avoid duplicates
    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existing) {
      return res.status(400).json({ error: "This category already exists." });
    }

    const newCategory = await prisma.category.create({
      data: { name: name.trim() }
    });

    console.log("✅ Category Created:", newCategory.name);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("❌ Create Category Error:", error.message);
    res.status(500).json({ error: "Failed to create category." });
  }
};

// Update your exports at the bottom of the file
// 6. UPDATE PRODUCT (PUT)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let imageUrl = existingProduct.imageUrl; // Keep old image by default

    // If a new file is uploaded, send it to Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ecommerce-products', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name ? String(name).trim() : existingProduct.name,
        description: description !== undefined ? String(description).trim() : existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        categoryId: categoryId ? parseInt(categoryId) : existingProduct.categoryId,
        imageUrl: imageUrl
      },
      include: { category: true }
    });

    res.status(200).json({ message: "Updated successfully! ✨", product: updatedProduct });
  } catch (error) {
    console.error("❌ Update Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update exports at the bottom
module.exports = { 
    createProduct, 
    getAllProducts, 
    getAllCategories, 
    deleteProduct, 
    getProductById, 
    createCategory,
    updateProduct // <-- Add this
};