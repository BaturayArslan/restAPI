const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const { mongoConnect } = require("./util/database");
const authMiddleWare = require("./util/authMiddleWare");

const app = express();

//multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileHandler = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    const err = new Error("wrong format");
    cb(err, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: storage, fileFilter: fileHandler }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

// for CORS
app.options("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.sendStatus(200);
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use("/feed", authMiddleWare, feedRoutes);
app.use("/auth", authRoutes);
app.use((err, req, res, next) => {
  const message = err.message;
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  const data = err.data;
  res.status(err.statusCode).json({ message: message, data: data });
});

mongoConnect(() => {
  app.listen(8080);
});
