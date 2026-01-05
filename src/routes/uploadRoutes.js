const express = require("express");
const multer = require("multer");
const { uploadToS3 } = require("../utils/s3");

const router = express.Router();

// Use in-memory storage; we stream buffers directly to S3
const upload = multer({ storage: multer.memoryStorage() });

// Allowed mime types for images and PDFs
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

router.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    const userId = req.user?.id || "anonymous";
    const ext = req.file.originalname.split(".").pop() || "bin";
    const timestamp = Date.now();
    const key = `uploads/${userId}/${timestamp}-${req.file.fieldname}.${ext}`;

    const url = await uploadToS3({
      buffer: req.file.buffer,
      key,
      contentType: req.file.mimetype,
    });

    return res.status(201).json({
      success: true,
      data: {
        url,
        key,
        mimeType: req.file.mimetype,
        size: req.file.size,
        originalName: req.file.originalname,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
