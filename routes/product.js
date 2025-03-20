const express = require("express");
const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { Product } = require("../models/association");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination, sorting, and filtering
 *     tags: [Products]
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
 *         description: List of products
 */
router.get("/products", async (req, res) => {
  try {
    let { page = 1, limit = 10, sort = "asc", search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          name: { [Op.like]: `%${search}%` },
        }
      : {};

    const products = await Product.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["price", sort]],
    });

    res.status(200).json({ total: products.count, data: products.rows });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
router.get("products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of the product (must be a positive number)
 *               categoryId:
 *                 type: integer
 *                 description: Category ID associated with the product
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional product image file
 *     responses:
 *       201:
 *         description: Product successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 categoryId:
 *                   type: integer
 *                 image:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.post(
  "/products",
  upload.single("image"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
    body("categoryId").isInt().withMessage("Category ID must be an integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, price, categoryId } = req.body;
      const image = req.file ? req.file.path : null;
      const product = await Product.create({ name, price, categoryId, image });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
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
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put(
  "/products/:id",
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      await product.update(req.body);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
