// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const { Category } = require('../models/category');

// const router = express.Router();

// /**
//  * @swagger
//  * /categories:
//  *   get:
//  *     summary: Get all categories with pagination, sorting, and filtering
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
//  *         description: List of categories
//  */
// router.get('/', async (req, res) => {
//     try {
//         let { page = 1, limit = 10, sort = 'asc', search = '' } = req.query;
//         page = parseInt(page);
//         limit = parseInt(limit);
//         const offset = (page - 1) * limit;

//         const whereCondition = search
//             ? { name: { [Op.like]: `%${search}%` } }
//             : {};

//         const categories = await Category.findAndCountAll({
//             where: whereCondition,
//             limit,
//             offset,
//             order: [['name', sort]]
//         });

//         res.status(200).json({ total: categories.count, data: categories.rows });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// /**
//  * @swagger
//  * /categories/{id}:
//  *   get:
//  *     summary: Get a category by ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Category found
//  *       404:
//  *         description: Category not found
//  */
// router.get('/:id', async (req, res) => {
//     try {
//         const category = await Category.findByPk(req.params.id);
//         if (!category) return res.status(404).json({ error: 'Category not found' });

//         res.status(200).json(category);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// /**
//  * @swagger
//  * /categories:
//  *   post:
//  *     summary: Create a new category
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Category created
//  *       400:
//  *         description: Validation error
//  */
// router.post('/', [
//     body('name').notEmpty().withMessage('Name is required')
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { name } = req.body;
//         const category = await Category.create({ name });

//         res.status(201).json(category);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// /**
//  * @swagger
//  * /categories/{id}:
//  *   put:
//  *     summary: Update a category
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
//  *     responses:
//  *       200:
//  *         description: Category updated
//  *       404:
//  *         description: Category not found
//  */
// router.put('/:id', async (req, res) => {
//     try {
//         const category = await Category.findByPk(req.params.id);
//         if (!category) return res.status(404).json({ error: 'Category not found' });

<<<<<<< HEAD
//         await category.update(req.body);
//         res.status(200).json(category);
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
=======
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', [
    body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
>>>>>>> 3b166a44c40ab51ead306820ad46ce51f372a37f

// /**
//  * @swagger
//  * /categories/{id}:
//  *   delete:
//  *     summary: Delete a category
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Category deleted
//  *       404:
//  *         description: Category not found
//  */
// router.delete('/:id', async (req, res) => {
//     try {
//         const category = await Category.findByPk(req.params.id);
//         if (!category) return res.status(404).json({ error: 'Category not found' });

//         await category.destroy();
//         res.status(200).json({ message: 'Category deleted' });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// module.exports = router;