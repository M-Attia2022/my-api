const prisma = require('../../config/db');

// ===== GET /products — جلب كل المنتجات =====
const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('[getAllProducts]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== GET /products/:id — جلب منتج واحد =====
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('[getProductById]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== POST /products — إضافة منتج (owner فقط) =====
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, img } = req.body;

    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), category, img },
    });

    return res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
  } catch (error) {
    console.error('[createProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== PATCH /products/:id — تعديل منتج (owner فقط) =====
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, category, img, isAvailable } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(img !== undefined && { img }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return res.status(200).json({ success: true, message: 'Product updated.', data: product });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    console.error('[updateProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== DELETE /products/:id — حذف منتج (owner فقط) =====
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.product.delete({ where: { id } });

    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    console.error('[deleteProduct]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
