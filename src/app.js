const express = require("express");
const cors = require("cors");
const { corsOrigin } = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

// Initialize express app
const app = express();

const allowedOrigins = [
  "https://profilium-frontend-frug.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ProfiliumBackend API",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
