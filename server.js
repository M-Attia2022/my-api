
const express = require('express');
const app = express();
app.use(express.json());

// بيانات تجريبية (بمثابة جدول قاعدة البيانات)
let cars = [
    { id: 1, name: "Toyota", model: "2024" },
    { id: 2, name: "Tesla", model: "2023" }
];

// الاند بوينت الأولى: الحصول على كل السيارات
app.get('/', (req, res) => {
    res.json(cars);
});

// الاند بوينت الثانية: إضافة سيارة جديدة
app.post('/add-car', (req, res) => {
    const newCar = req.body;
    cars.push(newCar);
    res.status(201).json({ message: "Car added!", cars });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app