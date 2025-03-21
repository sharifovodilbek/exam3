const express = require("express");
const { body, validationResult } = require("express-validator");
const { Op, where } = require("sequelize");
const { Order, OrderItem, User } = require("../models/association");
const authenticate = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  default: AsyncQueue,
} = require("sequelize/lib/dialects/mssql/async-queue");

const router = express.Router();

/**
 * @swagger
 * /getMyOrders:
 *   get:
 *     summary: Foydalanuvchining buyurtmalarini olish
 *     tags: [Orders]
 *     security:
 *     responses:
 *       200:
 *         description: Foydalanuvchining barcha buyurtmalari
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Buyurtmalar topilmadi
 *       401:
 *         description: Autentifikatsiya talab qilinadi
 *       500:
 *         description: Ichki server xatosi
 */

router.get("/getMyOrders", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const orders = await Order.findAll({
      where: { userId },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /getOrders:
 *   get:
 *     summary: Get all orders with pagination, sorting, and filtering
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get(
  "/getOrders",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      let { page = 1, limit = 10, sort = "asc", search = "" } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;

      const whereCondition = search
        ? { userId: { [Op.like]: `%${search}%` } }
        : {};

      const orders = await Order.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        include: [{ model: User }, { model: OrderItem }],
        order: [["createdAt", sort]],
      });

      res.status(200).json({ total: orders.count, data: orders.rows });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /getOrdersById/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
router.get("/getOrdersById/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }],
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /myOrders:
 *   get:
 *     summary: Foydalanuvchining buyurtmalarini olish (so‘nggi buyurtmalar birinchi)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Foydalanuvchining barcha buyurtmalari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buyurtmalar:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Buyurtma ID
 *                       userId:
 *                         type: integer
 *                         description: Foydalanuvchi IDsi
 *                       status:
 *                         type: string
 *                         description: Buyurtma holati
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Yaratilgan vaqt
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Yangilangan vaqt
 *       401:
 *         description: Autentifikatsiya talab qilinadi
 *       404:
 *         description: Buyurtmalar topilmadi
 *       500:
 *         description: Ichki server xatosi
 */

router.get("/myOrders", authenticate, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.send({ buyurtmalar: orders });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /createOrder:
 *   post:
 *     summary: Yangi buyurtma yaratish
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: integer
 *                   description: Mahsulot ID
 *                 count:
 *                   type: integer
 *                   description: Mahsulot soni
 *     responses:
 *       201:
 *         description: Buyurtmalar yaratildi
 *       400:
 *         description: Tekshiruv xatosi
 *       401:
 *         description: Autentifikatsiya talab qilinadi
 *       403:
 *         description: Ruxsat yo‘q
 *       500:
 *         description: Ichki server xatosi
 */

router.post(
  "/createOrder",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const buyurtmalar = req.body;
      const order = await Order.create({ userId: req.user.id });

      buyurtmalar.forEach(async (element) => {
        await OrderItem.create({
          orderId: order.id,
          productId: element.productId,
          count: element.count,
        });
      });
      res.status(201).json("Order(s) created");
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /deleteOrdersById/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 */
router.delete(
  "/deleteOrdersById/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      await order.destroy();
      res.status(200).json({ message: "Order deleted" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
