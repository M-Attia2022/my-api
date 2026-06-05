const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

// ===== Helper: إنشاء الـ Tokens =====
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// ===== POST /auth/register =====
const register = async (req, res) => {
  try {
    const { name, email, password, role, img } = req.body;

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, img },
      select: { id: true, name: true, email: true, role: true, img: true, createdAt: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: user,
    });
  } catch (error) {
    console.error('[register]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== POST /auth/login =====
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // إنشاء الـ Tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // حفظ الـ Refresh Token في DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, password: user.password, img: user.img },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== POST /auth/refresh =====
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    // التحقق من الـ Refresh Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    // التحقق من أن الـ token موجود في DB (لم يتم إلغاؤه)
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, refreshToken: token },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has been revoked. Please login again.',
      });
    }

    // إصدار Tokens جديدة
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // تحديث الـ Refresh Token في DB (Rotation)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    console.error('[refreshToken]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== POST /auth/logout =====
const logout = async (req, res) => {
  try {
    // حذف الـ Refresh Token من DB
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('[logout]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { register, login, refreshToken, logout };
