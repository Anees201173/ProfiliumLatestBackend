const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateUser } = require("../middlewares/validator");
const { authenticate } = require("../middlewares/auth");

// User routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", validateUser, userController.createUser);
router.put("/:id", validateUser, userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Authenticated user's profile
router.get("/me", authenticate, userController.getMyProfile);
router.put("/me", authenticate, userController.updateMyProfile);

module.exports = router;
