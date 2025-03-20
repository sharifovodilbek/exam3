/**
 * @swagger
 * tags:
 *   name: Regions
 *   description: Region management
 */

const express = require("express");
const Region = require("../models/region");
const {User} = require("../models/association");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/role");
const { Op } = require("sequelize");

const router = express.Router();

/**
 * @swagger
 * /regions:
 *   post:
 *     summary: Create a new region
 *     tags: [Regions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Region created successfully
 */
router.post("/regions", async (req, res) => {
  try {
    const region = await Region.create(req.body);
    res.status(201).json(region);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /regions:
 *   get:
 *     summary: Get all regions with filter, sort, and pagination
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by region name
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
 *         description: List of regions
 */
router.get("/regions", authenticate, async (req, res) => {
  try {
    const { name, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    const offset = (page - 1) * limit;

    const regions = await Region.findAndCountAll({
      where,
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: User }],
    });

    res.status(200).json({
      total: regions.count,
      pages: Math.ceil(regions.count / limit),
      data: regions.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /regions/{id}:
 *   put:
 *     summary: Update a region by ID
 *     tags: [Regions]
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
 *     responses:
 *       200:
 *         description: Region updated successfully
 */
router.put("/regions/:id", authenticate, authorize(["admin", "super admin"]), async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).json({ message: "Region not found" });

    await region.update(req.body);
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /regions/{id}:
 *   delete:
 *     summary: Delete a region by ID
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Region deleted successfully
 */
router.delete("/regions/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).json({ message: "Region not found" });

    await region.destroy();
    res.status(200).json({ message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
