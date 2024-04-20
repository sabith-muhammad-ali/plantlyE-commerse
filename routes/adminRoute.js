const express = require("express");
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const bannerController = require("../controllers/bannerController");
const couponController = require("../controllers/couponController");
const offerController = require("../controllers/offerController");
const admin = express();
const path = require("path");
const adminAuth = require("../middelware/adminAuth");


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
//Dashboard
admin.get("/", adminAuth.isLogout, adminController.loadLogin);
admin.post("/", adminAuth.isLogout, adminController.verifyLogin);
admin.get("/admindashbord", adminAuth.isLogin, adminController.loadDashboard);
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
admin.post("/order-status", adminAuth.isLogin, adminController.orderStatus)
//banner
admin.get("/banner", adminAuth.isLogin, bannerController.loadBanner);
admin.get("/add-banner", adminAuth.isLogin, bannerController.loadAddBanner);
admin.post("/add-banner", adminAuth.isLogin, upload.array('Image',1), bannerController.addBanner);
admin.get("/edit-banner", adminAuth.isLogin, bannerController.loadEditBanner);
admin.post("/edit-banner", upload.array("image",1), bannerController.editBanner);
admin.patch("/list-banner/:id", adminAuth.isLogin, bannerController.blockBanner);
//coupen
admin.get("/coupon", adminAuth.isLogin,couponController.loadCoupon);
admin.get("/load-add-coupons", adminAuth.isLogin, couponController.loadAddCoupon);
admin.post("/load-add-coupons", adminAuth.isLogin, couponController.addCoupon);
admin.get("/edit-coupon", adminAuth.isLogin, couponController.loadEditCoupon);
admin.post("/edit-coupon", adminAuth.isLogin, couponController.editCoupon);
admin.post("/delete-coupon", adminAuth.isLogin, couponController.removeCoupon);
//sales-report
admin.get("/sales-report", adminAuth.isLogin, adminController.loadSalesReport);
admin.post("/sales-report", adminAuth.isLogin, adminController.filterSalesReport);
//offer
admin.get("/load-offer", adminAuth.isLogin, offerController.loadOffer);
admin.get("/add-offer", adminAuth.isLogin, offerController.loadAddOffer);
admin.post("/add-offer", adminAuth.isLogin, offerController.addOffer);
admin.patch("/list-offer/:id", adminAuth.isLogin, offerController.listOffer)
admin.get("/edit-offer", adminAuth.isLogin, offerController.loadEditOffer)
admin.post("/edit-offer", adminAuth.isLogin, offerController.editOffer);
admin.post('/category-offer', adminAuth.isLogin, offerController.categoryOffer);
admin.post("/remove-category-offer", adminAuth.isLogin, offerController.removeCategoryOffer)
admin.post("/product-offer", adminAuth.isLogin, offerController.productOffer);
admin.post("/remove-product-offer", adminAuth.isLogin, offerController.removeProductOffer);

module.exports = admin;
