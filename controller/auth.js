const { validationResult } = require("express-validator");
const bcyrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/user");
const Post = require("../model/post");

exports.getSignUp = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error !!");
    err.statusCode = 422;
    err.data = error.array();
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  bcyrypt
    .hash(password, 12)
    .then((cryptPass) => {
      const user = new User({ email: email, password: cryptPass, name: name });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "succesfully signup.", result: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postSignIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let user;
  User.find({ email: email })
    .then((result) => {
      if (result.lenth === 0) {
        const err = new Error("cannot found user by this emaail adress.");
        err.statusCode = 401;
        throw err;
      }
      user = result[0];
      return bcyrypt.compare(password, user.password);
    })
    .then((result) => {
      if (!result) {
        const err = new Error("emial or password incorrect pls check.");
        err.statusCode = 401;
        throw err;
      }
      const token = jwt.sign(
        { name: user.name, userId: user._id.toString() },
        "veryverysecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "logging is succesfull",
        token: token,
        userId: user._id,
        name: user.name,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
