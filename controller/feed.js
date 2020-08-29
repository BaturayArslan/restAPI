const { validationResult } = require("express-validator");
const mongodb = require("mongodb");

const Post = require("../model/post");
const User = require("../model/user");

exports.getPosts = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  // res.status(200).json({
  //   posts: [
  //     {
  //       _id: "1",
  //       title: "this is my post.",
  //       content: "this is my firs post.",
  //       imgUrl: "images/cliff.jpg",
  //       creator: {
  //         name: "baturay arslan",
  //       },
  //       createdAt: new Date(),e
  //     },
  //   ],
  // });
  const ITEM_PER_PAGE = 2;
  let currentPage = req.query.page || 1;
  let totalItem;
  Post.count()
    .then((count) => {
      totalItem = count;
      return Post.find()
        .skip((currentPage - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .toArray();
    })
    .then((result) => {
      res.status(200).json({ posts: result, totalItems: totalItem });
    })
    .catch((err) => console.log(err));
};

exports.getSinglePost = (req, res, next) => {
  const postId = new mongodb.ObjectID(req.params.postId);
  res.setHeader("Content-Type", "application/json");

  Post.find({ _id: postId })
    .toArray()
    .then((result) => {
      res.status(200).json({ post: result[0] });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const imgUrl = req.file.path;
  const creator = {
    _id: req.userId,
    name: req.name,
  };
  const error = validationResult(req);
  // if any validation eror exist than send res with 422 status code
  if (!error.isEmpty()) {
    const err = new Error("validation erorr occure pls change your inputs.");
    err.statusCode = 422;
    throw err;
  }
  // if multer cant read image or user didnt enter correct input type
  if (!req.file) {
    const err = new Error(
      " multer validation erorr occure pls change your inputs."
    );
    err.statusCode = 422;
    throw err;
  }

  const post = new Post({
    title: title,
    content: content,
    imgUrl: imgUrl,
    creator: creator,
  });
  post
    .save()
    .then((result) => {
      console.log(post);
      return User.addPost({ postId: post._id.toString(), userId: req.userId });
    })
    .then((result) => {
      res.status(201).json({
        message: "post succesfully created.",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.editPost = (req, res, next) => {
  const postId = new mongodb.ObjectID(req.params.postId);
  const title = req.body.title;
  const content = req.body.content;
  let imgUrl = req.body.image;
  if (req.file) {
    imgUrl = req.file.path;
  }

  // validation check
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation erorr occure pls change your inputs.");
    err.statusCode = 422;
    throw err;
  }

  // ensure to imgUrl been set
  if (!imgUrl) {
    const err = new Error(" image does not found.");
    err.statusCode = 422;
    throw err;
  }

  const newPost = new Post({
    title: title,
    content: content,
    imgUrl: imgUrl,
    _id: postId,
  });
  newPost
    .save()
    .then((result) => {
      return Post.find({ _id: postId }).toArray();
    })
    .then((result) => {
      // check user have auth to delete this post
      if (result[0].creator._id.toString() !== req.userId.toString()) {
        const err = new Error("YOU ARE NOT AUTHORİZATE");
        err.statusCode = 403;
        throw err;
      }
      res.status(200).json({
        messsage: "post has been update.",
        post: result[0],
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = new mongodb.ObjectID(req.params.postId);
  Post.find({ _id: postId })
    .toArray()
    .then((result) => {
      if (result.length === 0) {
        const err = new Error("POST has not found");
        throw err;
      }
      // check user have auth to delete this post
      if (result[0].creator._id.toString() !== req.userId.toString()) {
        const err = new Error("YOU ARE NOT AUTHORİZATE");
        err.statusCode = 403;
        throw err;
      }

      return Post.delete(postId);
    })
    .then((result) => {
      return User.delProToUser({
        postId: req.params.postId,
        userId: req.userId,
      });
    })
    .then((result) => {
      res
        .status(200)
        .json({ message: "post succesfully deleted.", result: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
