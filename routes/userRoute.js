const express = require("express");
const user = express.Router();
const session = require("express-session");
const passport = require("passport");
const userController = require("../controllers/userController");
const googleauthController = require("../controllers/authController");
const addressController = require("../controllers/addressController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
const auth = require("../middelware/userAuth");

user.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);
//user
user.get("/", userController.homePage);
user.get("/registration", auth.isLogout, userController.loadRegister);
user.post("/registration", auth.isLogout, userController.insertUser);
user.get("/userOTP", auth.isLogout, userController.sendOTP);
user.post("/userOTP", auth.isLogout, userController.verifyOTP);
user.post("/resendotp", userController.resendOtp);
user.get("/login-User", auth.isLogout, userController.loadsignin);
user.post("/login-User", auth.isLogout, userController.verifyLogin);
user.get("/logout", auth.isLogin, userController.userLogout);
user.get("/user-profile", auth.isLogin, userController.userProfile);
user.post("/user-profile", auth.isLogin, userController.editUserProfile);
user.get("/add-address", auth.isLogin, addressController.loadAddAddress);
user.post("/add-address", auth.isLogin, addressController.addAddress);
user.get("/addresses", auth.isLogin, addressController.loadAddresses);
user.post("/addresses", auth.isLogin, addressController.editAddress);
user.delete("/delete-addresses", auth.isLogin, addressController.deleteAddress);
user.get("/change-password", auth.isLogin, userController.loadChangePassword);
user.post("/change-password", auth.isLogin, userController.changePassword);
user.get("/forget-password", auth.isLogout, userController.loadForgerPassword);
user.post("/forget-password", auth.isLogout, userController.checkEmail);
user.get(
  "/reset-password/:token",
  auth.isLogout,
  userController.loadRestPassword
);
user.post("/reset-password", auth.isLogout, userController.resetPassword);
//shop
user.get("/shop", auth.isLogin, userController.loadShop);
user.get("/single-product", auth.isLogin, userController.singleproduct);
//cart
user.get("/cart", auth.isLogin, cartController.cartLoad);
user.post("/addTo-cart", auth.isLogin, cartController.getCart);
user.post("/add-quantity", auth.isLogin, cartController.updateCartQuantity);
user.delete("/remove-cart", auth.isLogin, cartController.removeCart);
//order
user.get("/checkOut", auth.isLogin, orderController.loadCheckout);
user.post("/checkOut-addAddress", auth.isLogin, orderController.checkoutAddAddress);
user.post("/place-order", auth.isLogin, orderController.placeOrder);
user.get("/show-order", auth.isLogin, orderController.showOrder);
user.post("/show-order", auth.isLogin, orderController.cancelOrders);
user.get("/order-success", auth.isLogin, orderController.successsPage);
user.get("/product-details/:orderId", auth.isLogin, orderController.viewOrderDetails);
user.get("/order-invoice", auth.isLogin, orderController.invoice);
user.post("/verify-payment", auth.isLogin, orderController.verifyPayment);//razorpay
user.post("/return-order", auth.isLogin, orderController.returnOrder);
user.get("/load-wallet", auth.isLogin, orderController.loadWallet);

//wishlist
user.post("/add-wishlist", auth.isLogin, cartController.addToWishlist);
user.get("/load-wishlist", auth.isLogin, cartController.loadWishlist);
user.post("/remove-wishlist", auth.isLogin, cartController.removeWishlist);
//coupen
user.post("/select-coupon", auth.isLogin, couponController.redeemCoupon);
user.post("/remove-coupon", auth.isLogin, couponController.revokeCoupon);


//gogole
user.use(passport.initialize());
user.use(passport.session());

user.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

user.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

user.get("/auth/google/success", auth.isLogout, googleauthController.success);

user.get("/auth/google/failure", auth.isLogout, (req, res) => {
  res.send("something failed");
});

module.exports = user;
