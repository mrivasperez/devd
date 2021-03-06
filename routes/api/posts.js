const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();

const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// @route           POST api/posts
// @description     Create a post
// @access          Private
router.post(
  "/",
  [
    auth,
    // validate that text is not empty
    [check("text", "Text is required.").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");

      // create new post using Post model
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      // save new post
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route           GET api/posts
// @description     Get all posts
// @access          Private

router.get("/", auth, async (req, res) => {
  try {
    // create const using all posts, create desc
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route           GET api/posts/:id
// @description     Get specific post by ID
// @access          Private

router.get("/:id", auth, async (req, res) => {
  try {
    // request post by ID
    const post = await Post.findById(req.params.id);

    // verify there is a post by that id
    if (!post) return res.status(404).json({ message: "Post not found." });

    res.json(post);
  } catch (error) {
    console.error(error.message);
    // check if error has property of kind of ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(500).send("Server Error");
  }
});

// @route           DELETE api/posts/:id
// @description     Delete a post
// @access          Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);

    // check if there is a post with that ID
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    // make sure user deleting the post is owner of post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized." });
    }

    // delete the post
    await post.remove();
    // confirm post was deleted
    res.json({ msg: "Post removed." });
  } catch (error) {
    // check if error has property of kind of ObjectId
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found." });
    }

    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
