const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const candidateRoutes = require('./candidateRoutes');
const companyRoutes = require('./companyRoutes');
const uploadRoutes = require('./uploadRoutes');
const testRoutes = require('./testRoutes');
const questionRoutes = require('./questionRoutes');
const optionRoutes = require('./optionRoutes');
const candidateTestRoutes = require('./candidateTestRoutes');
const candidateAnswerRoutes = require('./candidateAnswerRoutes');
const jobRoutes = require('./jobRoutes');
const skillRoutes = require('./skillRoutes');
const messageRoutes = require('./messageRoutes');
const pricingRoutes = require('./pricingRoutes');
const faqRoutes = require('./faqRoutes');

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use("/users", userRoutes);
router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/companies', companyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/tests', testRoutes);
router.use('/questions', questionRoutes);
router.use('/options', optionRoutes);
router.use('/candidate-tests', candidateTestRoutes);
router.use('/candidate-answers', candidateAnswerRoutes);
router.use('/jobs', jobRoutes);
router.use('/skills', skillRoutes);
router.use('/messages', messageRoutes);
router.use('/pricing', pricingRoutes);
router.use('/faq', faqRoutes);
// File uploads (S3)
router.use("/uploads", require("./uploadRoutes"));

// Add more routes here
// router.use('/posts', postRoutes);
// router.use('/auth', authRoutes);

module.exports = router;
