/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

const express = require("express");
const Product = require("../models/product");
const { User } = require("../models/association");
const authenticate = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { Op } = require("sequelize");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - image
 *               - categoryId
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post(
  "/products",
  authenticate,
  authorize(["admin", "seller"]),
  async (req, res) => {
    try {
      const { name, price, image, categoryId, userId } = req.body;

      if (!name || !price || !image || !categoryId || !userId) {
        return res
          .status(400)
          .json({ message: "Barcha maydonlarni to'ldiring" });
      }

      const product = await Product.create({
        name,
        price,
        image,
        categoryId,
        userId,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Serverda xatolik", error });
    }
  }
);


router.get("/products", async (req, res) => {
  try {
    const {
      name,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where,
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: User }],
    });

    res.status(200).json({
      total: products.count,
      pages: Math.ceil(products.count / limit),
      data: products.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product data
 *       404:
 *         description: Product not found
 */
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User }],
    });
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product by ID
 *     tags: [Products]
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
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.patch(
  "/products/:id",
  authenticate,
  authorize(["admin", "seller"]),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Mahsulot topilmadi" });

      await product.update(req.body);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Serverda xatolik", error });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete(
  "/products/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product)
        return res.status(404).json({ message: "Mahsulot topilmadi" });

      await product.destroy();
      res.status(200).json({ message: "Mahsulot o'chirildi" });
    } catch (error) {
      res.status(500).json({ message: "Serverda xatolik", error });
    }
  }
);

module.exports = router;
