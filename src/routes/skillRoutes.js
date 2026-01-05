const express = require("express");
const router = express.Router();
const controller = require("../controllers/skillController");
const { authenticate } = require("../middlewares/auth");

// List and search
router.get("/", controller.list);
router.get("/search", controller.search);

// Admin-only management
router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;
