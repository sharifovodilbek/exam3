const express = require("express");
const { Comment, Product } = require("../models/association");
const authenticate = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         productId:
 *           type: integer
 *         star:
 *           type: integer
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /comments:
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
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               star:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post(
  "/comments",
  authenticate,
  authorize(["user", "admin", "seller"]),
  async (req, res) => {
    const { userId, productId, star, description } = req.body;
    try {
      const comment = await Comment.create({
        userId,
        productId,
        star,
        description,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.log(error);

      res.status(500).json({ message: "Server error", error });
    }
  }
);

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [{ model: Product, attributes: ["id", "name"] }],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 */
router.get("/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ model: Product, attributes: ["id", "name"] }],
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/**
 * @swagger
 * /comments/{id}:
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
 *               star:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
router.put(
  "/comments/:id",
  authenticate,
  authorize(["super admin", "admin","user"]),
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });
      await comment.update(req.body);
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/**
 * @swagger
 * /comments/{id}:
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
router.delete(
  "/comments/:id",
  authenticate,
  authorize(["user", "admin", "seller"]),
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });
      await comment.destroy();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

module.exports = router;
