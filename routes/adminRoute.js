const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const config = require("../config/config");
const adminController = require("../controllers/adminController");
const categoryController = require('../controllers/categoryController')
const admin = express();


admin.use(express.urlencoded({ extended: true }));
admin.use(express.json());



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
admin.get('/category',categoryController.productCategory);
admin.get('/categoryadd',categoryController.addCategory);
admin.post('/categoryadd',categoryController.insertCategory);
admin.patch('/blockcategory/:id',categoryController.Categoryblock);
admin.get('/categoryedit',categoryController.editCategory);
admin.post('/categoryedit',categoryController.updateCategory);

module.exports = admin;
