const express = require('express');
const router = express.Router();

const { getProfile, getAllUsers } = require('./user.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// GET /user/profile — أي مستخدم مسجل
router.get('/profile', authenticateToken, getProfile);

// GET /user/all — للـ owner فقط
router.get('/all', authenticateToken, authorizeRoles('owner'), getAllUsers);

module.exports = router;
