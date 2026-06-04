const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const productRoutes = require('./modules/product/product.routes');

const app = express();

// ===== Security Middlewares =====
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ===== Global Rate Limiting =====
app.use(globalLimiter);

// ===== Body Parsing =====
app.use(express.json({ limit: '10kb' })); // منع الـ requests الكبيرة جداً

// ===== Health Check =====
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'YallaKoshari API is running 🚀',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ===== API Routes =====
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/products', productRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route [${req.method}] ${req.originalUrl} not found.`,
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

module.exports = app;
