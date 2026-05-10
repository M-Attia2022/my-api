const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// مفتاح التشفير (تأكد من إضافته في Environment Variables على Vercel)
const JWT_SECRET = process.env.JWT_SECRET || "Attia_Koshari_Safe_2026_@#!";

// مصفوفة تجريبية للمستخدمين (سيتم استبدالها بـ PostgreSQL لاحقاً)
let users = [];

// --- Middleware للتحقق من الصلاحيات ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "يرجى تسجيل الدخول أولاً" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "جلسة انتهت أو توكن غير صالح" });
        req.user = user;
        next();
    });
};

// --- الاند بوينت: إنشاء حساب جديد (Registration) ---
app.post('/auth/register', [
    body('email').isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن لا تقل عن 6 أحرف'),
    body('role').isIn(['owner', 'customer', 'delivery']).withMessage('نوع المستخدم غير صحيح')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, name } = req.body;

    // التحقق من وجود المستخدم
    const userExists = users.find(u => u.email === email);
    if (userExists) return res.status(400).json({ message: "هذا المستخدم موجود بالفعل" });

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { id: users.length + 1, email, password: hashedPassword, role, name };
    users.push(newUser);

    res.status(201).json({ message: "تم إنشاء الحساب بنجاح", role: newUser.role });
});

// --- الاند بوينت: تسجيل الدخول (Login) ---
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
    }

    // إنشاء التوكن مع تضمين الـ Role
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
        message: "تم تسجيل الدخول بنجاح",
        token,
        user: { name: user.name, role: user.role }
    });
});

// --- مسار محمي لصاحب المحل فقط ---
app.post('/store/add-product', authenticateToken, (req, res) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: "عذراً، هذه الصلاحية خاصة بأصحاب المحلات فقط" });
    }
    res.json({ message: "تمت إضافة المنتج بنجاح إلى متجرك" });
});

// المسار الرئيسي للتأكد من عمل الـ API
app.get('/', (req, res) => {
    res.send("YallaKoshari API is running with Multi-Role Auth!");
});

// التصدير لـ Vercel
module.exports = app;

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}