const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const request = require("request");
const config = require("config");

const auth = require("../../middleware/auth");
const { remove } = require("../../models/Profile");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { response } = require("express");

// @route           GET api/profile/me
// @description     Get logged in user's profile
// @access          Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user." });
    }

    res.json(profile);
    // populate with name and avatar of user
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           POST api/profile
// @description     Create or update user profile
// @access          Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required.").not().isEmpty(),
      check("skills", "Skills is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // check for errors
    const errors = validationResult(req);
    // return errors if present
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};

    // Add each field
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};

    // Check for social fields
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // update or insert data

    try {
      // look for profile
      let profile = await Profile.findOne({ user: req.user.id });
      // update profile if found
      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // NO EXISTING PROFILE?
      // create it!
      profile = new Profile(profileFields);
      // save it
      await profile.save();
      // retrieve it
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route           GET api/profile
// @description     Get all profiles
// @access          Public

router.get("/", async (req, res) => {
  try {
    // create variable to store profile, use populate method to add users key with name and avatar vars
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    // send profiles
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           GET api/profile/user/:user_id
// @description     Get profile by user id
// @access          Public

router.get("/user/:user_id", async (req, res) => {
  try {
    // create variable to store profile, use populate method to add users key with name and avatar vars
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    // check if profile exists for user
    if (!profile)
      return res.status(400).json({ message: "Profile was not found." });

    // send profiles
    res.json(profile);
  } catch (error) {
    console.error(error.message);

    // check the kind of error to display profile or server error
    if (error.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile was not found." });
    }

    // send server error
    res.status(500).send("Server Error");
  }
});

// @route           DELETE api/profile
// @description     Delete profile, user, and posts
// @access          Private

router.delete("/", auth, async (req, res) => {
  try {
    // !TODO Remove user's posts

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findByIdAndRemove({ _id: req.user.id });

    // send profiles
    res.json({ message: "User has been deleted." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           PUT api/profile/experience
// @description     Add profile experience
// @access          Private

router.put(
  "/experience",
  [
    auth,
    [
      //validation
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get data from request
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      // get profile from db
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route           DELETE api/profile/experience/:experience_id
// @description     Delete experience from profile
// @access          Private

router.delete("/experience/:experience_id", auth, async (req, res) => {
  try {
    // get profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ message: "Profile was not found." });
    }

    // get index by id of experience
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.experience_id);

    // if experience is not found by id, then don't delete - prevents erroneously deleting
    if (removeIndex === -1) return res.json(profile);

    // remove the experience based on its index
    profile.experience.splice(removeIndex, 1);

    // save changes to user profile
    await profile.save();

    // send profile
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           PUT api/profile/education
// @description     Add profile education
// @access          Private

router.put(
  "/education",
  [
    auth,
    [
      //validation
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get data from request
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      // get profile from db
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route           DELETE api/profile/education/:experience_id
// @description     Delete education from profile
// @access          Private

router.delete("/education/:education_id", auth, async (req, res) => {
  try {
    // get profile of logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ message: "Profile was not found." });
    }

    // get index by id of education
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.education_id);

    // if education is not found by id, then don't delete - prevents erroneously deleting
    if (removeIndex === -1) return res.json(profile);

    // remove the education based on its index
    profile.education.splice(removeIndex, 1);

    // save changes to user profile
    await profile.save();

    // send profile
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           Get api/profile/github/:username
// @description     Get user Github repos
// @access          Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientID"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res
          .status(404)
          .json({ message: "No Github profile was found." });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
