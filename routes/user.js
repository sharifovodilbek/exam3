const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/association");
const sendSMS = require("../config/sendSMS");
const { sendEmail } = require("../config/sendEMAIL");
const router = express.Router();
const { totp, authenticator } = require("otplib");

totp.options = { step: 120 };
authenticator.options = { step: 120 };

/**
 * @swagger
 * /auth/send-otp-sms:
 *   post:
 *     summary: Telefon raqamga OTP jo‘natish
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
 *         description: OTP muvaffaqiyatli jo‘natildi
 *       400:
 *         description: Xato
 */
router.post("/send-otp-sms", async (req, res) => {
  const { phone } = req.body;
  try {
    const otptoken = totp.generate(phone + "sirlisoz");
    await sendSMS(phone, otptoken);
    res.send(otptoken);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/send-otp-email:
 *   post:
 *     summary: Emailga OTP jo‘natish
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
 *         description: OTP muvaffaqiyatli jo‘natildi
 *       400:
 *         description: Xato
 */
router.post("/send-otp-email", async (req, res) => {
  const { email } = req.body;
  try {
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
 * /auth/register:
 *   post:
 *     summary: Yangi foydalanuvchi ro‘yxatdan o‘tkazish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ro‘yxatdan o‘tgan foydalanuvchi
 *       400:
 *         description: Xato
 */

router.post("/verify-otp", async (req, res) => {
  const { otp, phone, email } = req.body;
  try {
    const matchEmail = authenticator.check(otp, email + "sirlisoz");
    const matchSms = totp.check(otp, phone + "sirlisoz");

    if (matchEmail || matchSms) {
      res.send("Verifyed");
    }
  } catch (error) {
    console.log(error);
    req.send("Not Verifyed");
  }
});

router.post("/register", async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, password: hashedPassword, email });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Foydalanuvchi tizimga kirishi
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli login
 *       400:
 *         description: Xato parol
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Parol xato" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", { expiresIn: "1h" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

/**
 * @swagger
 * /users:
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
 *         description: Foydalanuvchilar ro‘yxati
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "DESC", role } = req.query;
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
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Foydalanuvchini ID bo‘yicha olish
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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
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
router.put("/:id", async (req, res) => {
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
 * /users/{id}:
 *   delete:
 *     summary: Foydalanuvchini o‘chirish
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Foydalanuvchi o‘chirildi
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });
    await user.destroy();
    res.json({ message: "User o‘chirildi" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
