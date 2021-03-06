const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();

const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const { restart } = require("nodemon");

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

// @route           POST api/posts/like/:id
// @description     Like post by ID
// @access          Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    //   find post to be liked by ID
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ message: "Post not found." });

    //   check if the post has already been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res
        .status(400)
        .json({ message: "Post has already been liked by this user." });
    }

    // add user to like list
    await post.likes.unshift({ user: req.user.id });

    // save like
    await post.save();

    // return liked user list
    return res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

// @route           PUT api/posts/like/:id
// @description     Unike post by ID
// @access          Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    //   find post to be liked by ID
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ message: "Post not found." });

    //   check if the post is liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Post has not been liked by this user." });
    }

    // remove user to like list
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    // save like
    await post.save();

    // return liked user list
    return res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

// @route           POST api/posts/comment/:id
// @description     Comment on a post
// @access          Private
router.post(
  "/comment/:id",
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

      const post = await Post.findById(req.params.id);

      // create new post using Post model
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      // save new comment

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// TODO! Allow people to remove comments on THEIR post

// @route           DELETE api/posts/comment/:id/:comment_id
// @description     Delete comment from a post
// @access          Private
router.delete("/comment/:id/:comment_id/", auth, async (req, res) => {
  try {
    // get post by ID
    const post = await Post.findById(req.params.id);

    // get comment from post by ID
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // check if comment exists
    if (!comment) {
      return res.status(400).json({ message: "Comment does not exist." });
    }
    // make sure user that is deleting the comment is the user that made the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized." });
    }

    // get index of comment to delete
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    // save new post
    await post.save();

    // return existing comments
    return res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
