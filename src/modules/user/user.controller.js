const prisma = require('../../config/db');

// ===== GET /user/profile =====
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[getProfile]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ===== GET /user/all  (للـ owner فقط) =====
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('[getAllUsers]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getProfile, getAllUsers };
