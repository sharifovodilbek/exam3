const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/association");
const sendSMS = require("../config/sendSMS");
const { sendEmail } = require("../config/sendEMAIL");
const router = express.Router();
const { totp, authenticator } = require("otplib");
const multer = require("multer");
const { authorize } = require("../middleware/role");
const upload = multer({ dest: "uploads/" });
const authenticate = require("../middleware/auth");

totp.options = { step: 120 };
authenticator.options = { step: 120 };

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
function isValidPhone(phone) {
  const phoneRegex =
    /^\+?\d{1,3}?[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}$/;
  return phoneRegex.test(phone);
}
/**
 * @swagger
 * /send-otp-sms:
 *   post:
 *     summary: Telefon raqamga OTP jo'natish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP muvaffaqiyatli jo'natildi
 *       400:
 *         description: Xato
 */
router.post("/send-otp-sms", async (req, res) => {
  const { phone } = req.body;
  try {
    if (!isValidPhone(phone))
      return res.status(403).json({
        message: "Invalid phone",
        send: "Please enter phone on +9986667777",
      });
    const otptoken = totp.generate(phone + "sirlisoz");
    await sendSMS(phone, otptoken);
    res.send(otptoken);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /send-otp-email:
 *   post:
 *     summary: Emailga OTP jo'natish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP muvaffaqiyatli jo'natildi
 *       400:
 *         description: Xato
 */
router.post("/send-otp-email", async (req, res) => {
  const { email } = req.body;
  try {
    if (!isValidEmail(email))
      return res.status(403).json({
        message: "Invalid email",
        send: "Please enter email on user@example.com",
      });
    const secret = email + "sirlisoz";
    const otptoken = authenticator.generate(secret);
    await sendEmail(email, otptoken);
    res.send(otptoken);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP (Email yoki Telefon orqali)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *     responses:
 *       200:
 *         description: OTP muvaffaqiyatli tasdiqlandi
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Verifyed"
 *       400:
 *         description: Noto'g'ri ma'lumot yuborildi
 *       500:
 *         description: Server xatosi
 */

router.post("/verify-otp", async (req, res) => {
  const { otp, phone, email } = req.body;
  try {
    const matchEmail = authenticator.check(otp, email + "sirlisoz");
    const matchSms = totp.check(otp, phone + "sirlisoz");

    if (matchEmail || matchSms) {
      res.send("Verified");
    }
    res.status(400).json({ message: "Otp yaroqsiz" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Noto'g'ri ma'lumot yuborildi" });
  }
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Yangi foydalanuvchi ro'yxatdan o'tkazish
 *     description: Foydalanuvchi ro'yxatdan o'tishi uchun kerakli ma'lumotlarni yuboradi.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Foydalanuvchining ismi
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Foydalanuvchining paroli (hashed)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Foydalanuvchining elektron pochta manzili
 *               phone:
 *                 type: string
 *                 description: Foydalanuvchining telefon raqami
 *               regionId:
 *                 type: integer
 *                 description: Foydalanuvchining mintaqa ID si
 *               year:
 *                 type: string
 *                 description: Tug'ilgan yil
 *               role:
 *                 type: string
 *                 description: Foydalanuvchi roli
 *               image:
 *                 type: string
 *                 nullable: true
 *                 description: Foydalanuvchi rasmi (fayl yo'li yoki URL)
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tkazildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Foydalanuvchi ID si
 *                 name:
 *                   type: string
 *                   description: Foydalanuvchining ismi
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Foydalanuvchining email manzili
 *                 phone:
 *                   type: string
 *                   description: Telefon raqami
 *                 regionId:
 *                   type: integer
 *                   description: Mintaqa ID si
 *                 year:
 *                   type: string
 *                   description: Tug'ilgan yil
 *                 role:
 *                   type: string
 *                   description: Foydalanuvchi roli
 *                 image:
 *                   type: string
 *                   nullable: true
 *                   description: Foydalanuvchi rasmi (fayl yo'li yoki URL)
 *       400:
 *         description: Xatolik (foydalanuvchi allaqachon mavjud yoki noto'g'ri ma'lumotlar)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Xatolik haqida ma'lumot
 *       500:
 *         description: Server xatosi
 */

router.post("/register", upload.single("image"), async (req, res) => {
  const { name, password, email, phone, ...rest } = req.body;

  try {
    if (!isValidEmail(email))
      return res.status(403).json({ error: "Noto'g'ri email" });
    if (!isValidPhone(phone))
      return res.status(403).json({ error: "Noto'g'ri telefon raqam" });
    const existingUser = await User.findOne({ where: { email, phone } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      password: hashedPassword,
      email,
      ...rest,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Foydalanuvchini tizimga kirishi
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Foydalanuvchi emaili
 *         example: "user@example.com"
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: Foydalanuvchi paroli
 *         example: "yourpassword"
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli tizimga kirish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Noto'g'ri parol
 *       404:
 *         description: Foydalanuvchi topilmadi
 *       500:
 *         description: Server xatosi
 */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.query;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Noto'g'ri parol" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      "secret_key",
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      "secret_key",
      {
        expiresIn: "7d",
      }
    );
    res.json({ accessToken, user, refreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /getUsers:
 *   get:
 *     summary: Foydalanuvchilarni olish
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Sahifadagi yozuvlar soni
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Saralash maydoni
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Saralash tartibi
 *     responses:
 *       200:
 *         description: Foydalanuvchilar ro'yxati
 */
router.get(
  "/getUsers",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "DESC",
        role,
      } = req.query;
      const whereCondition = {};

      if (role) whereCondition.role = role;

      const users = await User.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [[sort, order]],
      });

      res.json({
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / parseInt(limit)),
        data: users.rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /getUserById/{id}:
 *   get:
 *     summary: Foydalanuvchini ID bo'yicha olish
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Topilgan foydalanuvchi
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.get(
  "/getUserById/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User topilmadi" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /updateUser/{id}:
 *   put:
 *     summary: Foydalanuvchini yangilash
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangilangan foydalanuvchi
 */
router.put("/updateUser/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /deleteUser/{id}:
 *   delete:
 *     summary: Foydalanuvchini o'chirish
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foydalanuvchi o'chirildi
 */
router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });
    await user.destroy();
    res.json({ message: "User o'chirildi", user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Joriy foydalanuvchi ma'lumotlarini olish
 *     description: Avtorizatsiyadan o'tgan foydalanuvchi o'zining profil ma'lumotlarini oladi.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari qaytarildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Foydalanuvchi ID si
 *                 name:
 *                   type: string
 *                   description: Foydalanuvchining ismi
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Foydalanuvchining elektron pochta manzili
 *                 phone:
 *                   type: string
 *                   description: Telefon raqami
 *                 regionId:
 *                   type: integer
 *                   description: Mintaqa ID si
 *                 year:
 *                   type: string
 *                   description: Tug'ilgan yil
 *                 role:
 *                   type: string
 *                   description: Foydalanuvchi roli
 *                 image:
 *                   type: string
 *                   nullable: true
 *                   description: Foydalanuvchi rasmi (fayl yo'li yoki URL)
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Avtorizatsiya talab qilinadi"
 *       404:
 *         description: Foydalanuvchi topilmadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "User topilmadi"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: "Serverdagi xatolik haqida ma'lumot"
 */

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Refresh token created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid token
 */

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const token = await jwt.verify(refreshToken, "secret_key");

    const accessToken = jwt.sign(
      { id: token.id, role: token.role },
      "secret_key",
      {
        expiresIn: "1h",
      }
    );
    res.status(201).json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
