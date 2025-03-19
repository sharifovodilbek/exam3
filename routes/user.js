const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/association");
const sendSMS = require("../config/sendSMS");
const { sendEmail } = require("../config/sendEMAIL");
const router = express.Router();

const { totp, authenticator } = require("otplib");
totp.options = {
  step: 120,
};
authenticator.options = {
  step: 120,
};
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
  const { name, password, regionId, phone, image, email, year, role } =
    req.body;
  try {
    await User.findOne({ where: { email } });
    if (User) return res.send("user already exist");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      password: hashedPassword,
      regionId,
      phone,
      image,
      email,
      year,
      role,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Parol xato" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret_key", {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User topilmadi" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
