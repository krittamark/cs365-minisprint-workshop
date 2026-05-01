const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
// Render จะส่งพอร์ตมาทาง process.env.PORT
const PORT = process.env.PORT || 3000; 

// --- Middleware ---
app.use(express.json()); // ให้ Express อ่านข้อมูล JSON ที่ส่งมาจาก Frontend ได้
app.use(cookieParser()); // ให้ Express จัดการเรื่อง Cookie ได้

// ตั้งค่า CORS (สำคัญมากสำหรับการส่ง Cookie ข้ามโดเมน)
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000'], // **ตอน Deploy จริง ต้องเพิ่ม URL เว็บ Frontend ของคุณเข้าไปด้วย**
    credentials: true // อนุญาตให้รับ-ส่ง Cookie ได้
}));

// --- Mock Database ---
const FAKE_DB = {
    "admin": "Password123!",
    "admin1" : "Password1234",
};

// --- API Endpoint สำหรับ Login ---
app.post('/login', (req, res) => {
    // เปลี่ยนตัวแปรตามที่ Frontend ส่งมา (remember_me หรือ rememberMe ก็ได้)
    const { username, password, rememberMe } = req.body;

    // 1. ตรวจสอบ Username / Password
    if (FAKE_DB[username] !== password) {
        return res.status(401).json({ detail: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 2. จำลองการสร้าง Token (ของจริงควรใช้ JWT)
    const fakeToken = `token_for_${username}`;

    // 3. จัดการระบบ Remember Me ด้วย HttpOnly Cookie
    const cookieOptions = {
        httpOnly: true, // ป้องกัน XSS (ไม่ให้ JavaScript ฝั่งหน้าเว็บอ่านค่าได้)
        secure: true,   // ต้องเป็น true เมื่อรันบน HTTPS (Render เป็น HTTPS อยู่แล้ว)
        sameSite: 'none' // ให้ส่ง Cookie ข้ามโดเมนเนมได้
    };

    // ถ้าติ๊ก "จำฉันไว้" ให้ Cookie อยู่ได้ 30 วัน (คำนวณเป็นมิลลิวินาที)
    // ถ้าไม่ติ๊ก Cookie จะเป็น Session อัตโนมัติ (หายไปเมื่อปิดเบราว์เซอร์)
    if (rememberMe) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; 
    }

    // สั่งแนบ Cookie ไปกับ Response
    res.cookie('auth_token', fakeToken, cookieOptions);
    
    res.json({ message: "Login successful", user: username });
});

// --- เริ่มเปิดเซิร์ฟเวอร์ ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});