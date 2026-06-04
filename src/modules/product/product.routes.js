const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('./product.controller');

const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');
const { createProductValidation } = require('./product.validation');
const validate = require('../../middlewares/validate.middleware');

// GET /products         — عام (مش محتاج login)
router.get('/', getAllProducts);

// GET /products/:id     — عام
router.get('/:id', getProductById);

// POST /products        — owner فقط
router.post('/', authenticateToken, authorizeRoles('owner'), createProductValidation, validate, createProduct);

// PATCH /products/:id   — owner فقط
router.patch('/:id', authenticateToken, authorizeRoles('owner'), updateProduct);

// DELETE /products/:id  — owner فقط
router.delete('/:id', authenticateToken, authorizeRoles('owner'), deleteProduct);

module.exports = router;
