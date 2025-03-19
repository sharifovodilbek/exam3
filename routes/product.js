
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const  Product = require('../models/product');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
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
router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, sort = 'asc', search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const whereCondition = search
            ? {
                name: { [Op.like]: `%${search}%` }
            }
            : {};

        const products = await Product.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['price', sort]]
        });

        res.status(200).json({ total: products.count, data: products.rows });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
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
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post(
    '/',
    upload.single('image'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
        body('categoryId').isInt().withMessage('Category ID must be an integer')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            console.log("Request body:", req.body);
            console.log("Uploaded file:", req.file);

            const { name, price, categoryId } = req.body;
            const image = req.file ? req.file.path : null;

            const product = await Product.create({ 
                name, 
                price: parseFloat(price), 
                categoryId: parseInt(categoryId, 10), 
                image 
            });

            res.status(201).json(product);
        } catch (error) {
            console.error("Product yaratishda xatolik:", error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
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
router.put('/:id', [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await product.destroy();
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
