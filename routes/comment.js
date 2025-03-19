const express = require("express");
const Comment = require("../models/comment");
const User = require("../models/user");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *         star:
 *           type: integer
 *         userID:
 *           type: integer
 *         elonID:
 *           type: integer
 *         user:
 *           $ref: '#/components/schemas/User'
 *         elon:
 *           $ref: '#/components/schemas/Elon'
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     Elon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               star:
 *                 type: integer
 *               userID:
 *                 type: integer
 *               elonID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post("/", authenticate, authorize("user"), async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments with filter, sort, and pagination
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: content
 *         schema:
 *           type: string
 *         description: Filter comments by content
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *         description: Field to sort by
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
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
router.get("/", async (req, res) => {
  try {
    const {
      content,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const where = content ? { content: { [Op.like]: `%${content}%` } } : {};
    const offset = (page - 1) * limit;

    const comments = await Comment.findAndCountAll({
      where,
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: User }, { model: Elon }],
    });

    res.status(200).json({
      totalItems: comments.count,
      totalPages: Math.ceil(comments.count / limit),
      currentPage: parseInt(page),
      data: comments.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
router.put(
  "/:id",
  authenticate,
  authorize(["user", "super admin"]),
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      await comment.update(req.body);
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete("/:id", authenticate, authorize("user"), async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
