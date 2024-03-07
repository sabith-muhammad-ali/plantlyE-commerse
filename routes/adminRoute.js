const express = require("express");
const session = require("express-session");
const config = require("../config/config");
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const admin = express();
const path = require("path");

console.log(path.join(__dirname, "../public/multer"));

admin.use(express.urlencoded({ extended: true }));
admin.use(express.json());

// View setup
admin.set("views", path.join(__dirname, "views"));
admin.set("view engine", "ejs");
admin.set("views", "./views/admin");

// Static files setup
admin.use(express.static("public"));

// Multer setup for file uploads
const multer = require("multer");
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "../public/assets/multer"));
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
//user
admin.get("/userprofile", adminController.userManagement);
admin.patch("/blockusers/:id", adminController.blockUser);
//category
admin.get("/category", categoryController.productCategory);
admin.get("/categoryadd", categoryController.addCategory);
admin.post("/categoryadd", categoryController.insertCategory);
admin.patch("/blockcategory/:id", categoryController.Categoryblock);
admin.get("/categoryedit", categoryController.editCategory);
admin.post("/categoryedit", categoryController.updateCategory);
//product
admin.get("/product", productController.loadproduct);
admin.get("/addproduct", productController.addProduct);
admin.post(
  "/addproduct",
  upload.array("image", 4),
  productController.insertProduct
);
admin.patch("/blockproduct/:id", productController.productblock);
admin.get("/editproduct", productController.loadeditproduct);
admin.post(
  "/editproduct",
  upload.array(image, 4),
  productController.productedit
);

module.exports = admin;
