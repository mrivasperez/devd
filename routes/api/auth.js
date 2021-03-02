const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route           GET api/auth
// @description     Auth user
// @access          Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // return user info minus pw
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// ROUTES ---
// @route           POST api/auth
// @description     Authenticate user and get token
// @access          Public
router.post(
  "/",
  [
    // LOGIN VALIDATION REQUIREMENTS
    // email is an email
    check("email", "Email is required.").isEmail(),
    // password has 6 chars
    check("password", "Password is required.").exists(),
  ],
  // BEGIN REQUEST
  async (req, res) => {
    const errors = validationResult(req); // check for errros

    // if there are errors (errors is not empty), return errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        // if user does not exist return error
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid credentials." }] });
      }

      //   Make sure password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ message: "Invalid credentials." }] });
      }

      // create jwt payload
      const payload = {
        user: { id: user.id },
      };

      // sign and return JWT
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 }, //!TODO expires in 3600
        (error, token) => {
          if (error) throw error; // return error
          res.json({ token }); // return token
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
