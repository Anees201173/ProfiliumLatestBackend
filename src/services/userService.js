const db = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Get all users
 */
exports.getAllUsers = async () => {
  return await db.User.findAll({
    attributes: { exclude: ["password"] },
  });
};

/**
 * Get user by ID
 */
exports.getUserById = async (id) => {
  return await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
};

/**
 * Get user by email (including password)
 */
exports.getUserByEmail = async (email) => {
  return await db.User.findOne({ where: { email } });
};

/**
 * Create new user
 */
exports.createUser = async (userData) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);

  const user = await db.User.create(userData);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Update user
 */
exports.updateUser = async (id, userData) => {
  const user = await db.User.findByPk(id);

  if (!user) {
    return null;
  }

  // Hash password if it's being updated
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }

  await user.update(userData);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};

/**
 * Delete user
 */
exports.deleteUser = async (id) => {
  const user = await db.User.findByPk(id);

  if (!user) {
    return null;
  }

  await user.destroy();
  return true;
};
