const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token was found. Authorization denied." });
  }

  //   Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user; // get user from payload of token
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token is not valid. Authorization denied." });
  }
};
