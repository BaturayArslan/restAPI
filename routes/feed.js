const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controller/feed");
const authMiddleWare = require("../util/authMiddleWare");

const router = express.Router();

router.get("/posts", feedController.getPosts);

router.get("/post/:postId", feedController.getSinglePost);

router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.editPost
);

router.delete("/post/:postId", feedController.deletePost);

module.exports = router;
