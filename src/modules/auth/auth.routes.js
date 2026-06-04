const express = require('express');
const router = express.Router();

const { register, login, refreshToken, logout } = require('./auth.controller');
const { registerValidation, loginValidation } = require('./auth.validation');
const validate = require('../../middlewares/validate.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimit.middleware');

// POST /auth/register
router.post('/register', authLimiter, registerValidation, validate, register);

// POST /auth/login
router.post('/login', authLimiter, loginValidation, validate, login);

// POST /auth/refresh  (بيجدد الـ Access Token)
router.post('/refresh', refreshToken);

// POST /auth/logout  (محتاج يكون logged in)
router.post('/logout', authenticateToken, logout);

module.exports = router;
