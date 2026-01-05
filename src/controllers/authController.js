const userService = require("../services/userService");
const { generateToken, verifyPassword } = require("../middlewares/auth");

/**
 * Signup - create user and return token
 */
exports.signup = async (req, res, next) => {
  try {
    const payload = req.body;

    const user = await userService.createUser(payload);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

/**
 * Signin - authenticate and return token
 */
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const userJson = user.toJSON();
    delete userJson.password;

    const token = generateToken({
      id: userJson.id,
      email: userJson.email,
      role: userJson.role,
    });

    res.status(200).json({ success: true, data: { user: userJson, token } });
  } catch (error) {
    next(error);
  }
};
