const express = require("express");
const { body } = require("express-validator");

const authController = require("../controller/auth");
const User = require("../model/user");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("invalid Email")
      .custom((value, { req }) => {
        return User.find({ email: value })
          .then((result) => {
            if (result.length >= 1) {
              return Promise.reject("this email already use");
            }
          })
          .catch((err) => console.log(err));
      })
      .normalizeEmail(),
    body("password").isLength({ min: 5 }),
    body("name").not().isEmpty(),
  ],
  authController.getSignUp
);

router.post("/signIn", authController.postSignIn);

module.exports = router;
