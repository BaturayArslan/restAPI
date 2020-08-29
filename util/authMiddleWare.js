const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    const err = new Error("token hasnt been send by frontend.");
    err.statusCode = 422;
    throw err;
  }
  let data;
  try {
    data = jwt.verify(token, "veryverysecret");
  } catch {
    const err = new Error("a problem occure pls try later");
    err.statusCode = 500;
    next(err);
  }
  if (!data) {
    const error = new Error("token validation failed.");
    error.statusCode = 422;
    throw error;
  }
  req.userId = data.userId;
  req.name = data.name;
  next();
};
