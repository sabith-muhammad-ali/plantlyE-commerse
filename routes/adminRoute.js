const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const config = require("../config/config");
const adminController = require("../controllers/adminController");
// const auth = require('../middelware/admin.Auth');

const admin = express();

// Session setup
// admin.use(session({ secret: config.sessionSecret }));

// View setup
admin.set("views", path.join(__dirname, "views"));
admin.set("view engine", "ejs");
admin.set("views", "./views/admin");

// Static files setup
admin.use(express.static("public"));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productimages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

admin.get("/", adminController.loadLogin);
admin.post("/", adminController.verifyLogin);
admin.get("/admindashbord", adminController.loadDashbord);
admin.get("/userprofile", adminController.userManagement);
admin.patch("/blockusers/:id", adminController.blockUser);

module.exports = admin;
