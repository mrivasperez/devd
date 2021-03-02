const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
const User = require("../../models/User");

// ROUTES ---
// @route           POST api/users
// @description     User registration
// @access          Public
router.post(
  "/",
  [
    // VALIDATION REQUIREMENTS
    // has name
    check("name", "Name is required.").not().isEmpty(),
    // email is an email
    check("email", "Please include a valid email.").isEmail(),
    // password has 6 chars
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).isLength({ min: 6 }),
  ],
  // BEGIN REQUEST
  async (req, res) => {
    const errors = validationResult(req); // check for errros

    // if there are errors (errors is not empty), return errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        // if user exists return error
        return res
          .status(400)
          .json({ errors: [{ message: "User already exists." }] });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // Create user instance
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // ENCRYPT PASSWORD
      // Create salt for encryption
      const salt = await bcrypt.genSalt(10);
      // hash password
      user.password = await bcrypt.hash(password, salt);

      // SAVE USER
      await user.save();

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
