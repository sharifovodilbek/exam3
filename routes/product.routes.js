// const express = require("express");
// const { body, validationResult } = require("express-validator");
// const { Op } = require("sequelize");
// const { Product } = require("../models/association");
// const multer = require("multer");
// const { authorize } = require("../middleware/role");
// const authenticate = require("../middleware/auth");

// const upload = multer({ dest: "uploads/" });
// const router = express.Router();

// /**
//  * @swagger
//  * /products:
//  *   get:
//  *     summary: Get all products with pagination, sorting, and filtering
//  *     tags: [Products]
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: sort
//  *         schema:
//  *           type: string
//  *           enum: [asc, desc]
//  *       - in: query
//  *         name: search
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of products
//  */
// router.get("/products", async (req, res) => {
//   try {
//     let { page = 1, limit = 10, sort = "asc", search = "" } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);
//     const offset = (page - 1) * limit;

//     const whereCondition = search
//       ? {
//           name: { [Op.like]: `%${search}%` },
//         }
//       : {};

//     const products = await Product.findAndCountAll({
//       where: whereCondition,
//       limit,
//       offset,
//       order: [["price", sort]],
//     });

//     res.status(200).json({ total: products.count, data: products.rows });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * @swagger
//  * /products/{id}:
//  *   get:
//  *     summary: Get a product by ID
//  *     tags: [Products]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Product found
//  *       404:
//  *         description: Product not found
//  */
// router.get("/products/:id", async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * @swagger
//  * /products:
//  *   post:
//  *     summary: Create a new product
//  *     tags: [Products]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: Name of the product
//  *               price:
//  *                 type: number
//  *                 description: Price of the product (must be a positive number)
//  *               categoryId:
//  *                 type: integer
//  *                 description: Category ID associated with the product
//  *               userId:
//  *                 type: integer
//  *                 description: User ID associated with the product
//  *               image:
//  *                 type: string
//  *                 format: binary
//  *                 description: Optional product image file
//  *     responses:
//  *       201:
//  *         description: Product successfully created
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                 name:
//  *                   type: string
//  *                 price:
//  *                   type: integer
//  *                 categoryId:
//  *                   type: integer
//  *                 userId:
//  *                   type: integer
//  *                 image:
//  *                   type: string
//  *       400:
//  *         description: Validation error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 errors:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       msg:
//  *                         type: string
//  *       500:
//  *         description: Internal server error
//  */

// router.post(
//   "/products",
//   authenticate,
//   authorize(["admin", "seller"]),
//   upload.single("image"),
//   // [
//   //   body("name").notEmpty().withMessage("Name is required"),
//   //   body("price")
//   //     .isFloat({ gt: 0 })
//   //     .withMessage("Price must be a positive number"),
//   //   body("categoryId").isInt().withMessage("Category ID must be an integer"),
//   // ],
//   async (req, res) => {
//     // const errors = validationResult(req);
//     // if (!errors.isEmpty()) {
//     //   return res.status(400).json({ errors: errors.array() });
//     // }

//     try {
//       const { name, price, categoryId, userId } = req.body;
//       const image = req.file ? req.file.path : null;
//       const product = await Product.create({
//         name,
//         price,
//         categoryId,
//         userId,
//         image,
//       });

//       res.status(201).json(product);
//     } catch (error) {
//       console.log(error);

//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// /**
//  * @swagger
//  * /products/{id}:
//  *   patch:
//  *     summary: Update a product
//  *     tags: [Products]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               price:
//  *                 type: number
//  *     responses:
//  *       200:
//  *         description: Product updated
//  *       404:
//  *         description: Product not found
//  */
// router.patch(
//   "/products/:id",
//   authenticate,
//   authorize(["admin", "seller"]),
//   [
//     body("name").optional().notEmpty().withMessage("Name cannot be empty"),
//     body("price")
//       .optional()
//       .isFloat({ gt: 0 })
//       .withMessage("Price must be a positive number"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const product = await Product.findByPk(req.params.id);
//       if (!product) return res.status(404).json({ error: "Product not found" });

//       await product.update(req.body);
//       res.status(200).json(product);
//     } catch (error) {
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// /**
//  * @swagger
//  * /products/{id}:
//  *   delete:
//  *     summary: Delete a product
//  *     tags: [Products]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Product deleted
//  *       404:
//  *         description: Product not found
//  */
// router.delete(
//   "/products/:id",
//   authenticate,
//   authorize(["admin", "seller"]),
//   async (req, res) => {
//     try {
//       const product = await Product.findByPk(req.params.id);
//       if (!product) return res.status(404).json({ error: "Product not found" });

//       await product.destroy();
//       res.status(200).json({ message: "Product deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// module.exports = router;
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
router.post("/products", authenticate, authorize(["admin", "seller"]), async (req, res) => {
  try {
    const { name, price, image, categoryId, userId } = req.body;

    if (!name || !price || !image || !categoryId || !userId) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }

    const product = await Product.create({ name, price, image, categoryId, userId });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters, sorting, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by createdAt or updatedAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/products", async (req, res) => {
  try {
    const { name, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;

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
    const product = await Product.findByPk(req.params.id, { include: [{ model: User }] });
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

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
router.patch("/products/:id", authenticate, authorize(["admin", "seller"]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error });
  }
});

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
router.delete("/products/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    await product.destroy();
    res.status(200).json({ message: "Mahsulot o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error });
  }
});

module.exports = router;

