const express = require("express");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { OrderItem } = require("../models/association");

const router = express.Router();

/**
 * @swagger
 * /getOrder-items:
 *   get:
 *     summary: Get all order items with pagination, sorting, and filtering
 *     tags: [Order-items]
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
 *         description: List of order items
 */
router.get("/getOrder-items", async (req, res) => {
  try {
    let { page = 1, limit = 10, sort = "asc", search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { orderId: { [Op.like]: `%${search}%` } },
            { productId: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const orderItems = await OrderItem.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["createdAt", sort]],
    });

    res.status(200).json({ total: orderItems.count, data: orderItems.rows });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /getOrder-itemsById{id}:
 *   get:
 *     summary: Get an order item by ID
 *     tags: [Order-items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order item found
 *       404:
 *         description: Order item not found
 */
router.get("/getOrder-itemsById/:id", async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem)
      return res.status(404).json({ error: "Order item not found" });

    res.status(200).json(orderItem);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /createOrderItem:
 *   post:
 *     summary: Create a new order item
 *     tags: [Order-items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               count:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order item created
 *       400:
 *         description: Validation error
 */
router.post(
  "/createOrderItem",
  [
    body("orderId").isInt().withMessage("Order ID must be an integer"),
    body("productId").isInt().withMessage("Product ID must be an integer"),
    body("count").isInt().withMessage("Count must be an integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { orderId, productId, count } = req.body;
      const orderItem = await OrderItem.create({ orderId, productId, count });
      res.status(201).json(orderItem);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /orderDeleteById/{id}:
 *   delete:
 *     summary: Delete an order item
 *     tags: [Order-items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order item deleted
 *       404:
 *         description: Order item not found
 */
router.delete("/orderDeleteById/:id", async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem)
      return res.status(404).json({ error: "Order item not found" });

    await orderItem.destroy();
    res.status(200).json({ message: "Order item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
