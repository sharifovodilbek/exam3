const express = require("express");
const upload  = require("../middleware/upload");

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file and get the URL
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   example: "http://localhost:5000/uploads/1711045678901.jpg"
 */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl });
});

module.exports = router;
