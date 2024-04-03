const express = require("express");
const session = require("express-session");

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const bannerController = require("../controllers/bannerController");
const admin = express();
const path = require("path");
const adminAuth = require("../middelware/adminAuth");

console.log(path.join(__dirname, "../public/multer"));

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

admin.get("/", adminAuth.isLogout, adminController.loadLogin);
admin.post("/", adminAuth.isLogout, adminController.verifyLogin);
admin.get("/admindashbord", adminAuth.isLogin, adminController.loadDashbord);
admin.get("/logout", adminController.logout);
//userUpdate
admin.get("/userprofile", adminAuth.isLogin, adminController.userManagement);
admin.patch("/blockusers/:id", adminAuth.isLogin, adminController.blockUser);
//category
admin.get("/category", adminAuth.isLogin, categoryController.productCategory);
admin.get("/categoryadd", adminAuth.isLogin, categoryController.addCategory);
admin.post("/categoryadd", adminAuth.isLogin, categoryController.insertCategory);
admin.patch("/blockcategory/:id", adminAuth.isLogin, categoryController.Categoryblock);
admin.get("/categoryedit", adminAuth.isLogin, categoryController.editCategory);
admin.post("/categoryedit", adminAuth.isLogin, categoryController.updateCategory);
//product
admin.get("/product", adminAuth.isLogin, productController.loadproduct);
admin.get("/addproduct", adminAuth.isLogin, productController.addProduct);
admin.post("/addproduct", upload.array("image", 4), adminAuth.isLogin, productController.insertProduct);
admin.patch("/blockproduct/:id", adminAuth.isLogin, productController.productblock);
admin.get("/editproduct", adminAuth.isLogin, productController.loadeditproduct);
admin.post("/editproduct", upload.array("image", 4), adminAuth.isLogin, productController.editProduct);
admin.post("/deleteimage", productController.editProductImage);
//orders
admin.get("/orderlist", adminAuth.isLogin, adminController.ordersLoad);
//banner
admin.get("/banner", adminAuth.isLogin, bannerController.loadBanner);
admin.get("/add-banner", adminAuth.isLogin, bannerController.loadAddBanner);
admin.post("/add-banner", adminAuth.isLogin, upload.array('Image',1), bannerController.addBanner);
admin.get("/edit-banner", adminAuth.isLogin, bannerController.loadEditBanner);
admin.post("/edit-banner", upload.array("image",1), bannerController.editBanner);
module.exports = admin;
