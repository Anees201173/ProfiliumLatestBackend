require("dotenv").config();
// Debug: verify pg is resolvable in the deployed environment before models are required
try {
  const pgPath = require.resolve("pg");
  console.log("pg resolved to:", pgPath);
  try {
    const pgPkg = require("pg/package.json");
    console.log("pg version:", pgPkg.version);
  } catch (e) {
    console.log("pg package.json not found, but pg resolved");
  }
} catch (err) {
  console.error("pg cannot be resolved in runtime:", err && err.message ? err.message : err);
}

const app = require("./src/app");
const db = require("./src/models");
const { port } = require("./src/config/env");
const logger = require("./src/utils/logger");

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info(
      "✅ Database connection established successfully (Neon PostgreSQL)"
    );

    if (process.env.NODE_ENV !== "production") {
      await db.sequelize.sync({ alter: false });
      logger.info("✅ Database synchronized (sync alter)");
    }

    // Start server
    app.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🌐 API: http://localhost:${port}/api`);
    });
  } catch (error) {
    logger.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
