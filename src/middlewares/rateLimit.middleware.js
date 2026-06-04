const rateLimit = require('express-rate-limit');

// Rate limiter للـ auth routes (منع brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,                   // أقصى 10 محاولات لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Rate limiter عام للـ API
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 100,            // 100 request في الدقيقة
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

module.exports = { authLimiter, globalLimiter };
