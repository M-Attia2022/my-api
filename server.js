require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// تشغيل السيرفر محلياً فقط (Vercel بيتعامل معاه كـ serverless function)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// التصدير لـ Vercel
module.exports = app;