const express = require("express");
const user = express.Router();
const session = require("express-session");
const passport = require("passport");
const userController = require("../controllers/userController");
const googleauthController = require("../controllers/authController");
const auth = require("../middelware/userAuth");

user.use(express.urlencoded({ extended: true }));
user.use(express.json());

user.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

user.get("/", userController.homePage);
user.get("/registration", auth.isLogout, userController.loadRegister);
user.post("/registration", auth.isLogout, userController.insertUser);
user.get("/userOTP", auth.isLogout, userController.sendOTP);
user.post("/userOTP", auth.isLogout, userController.verifyOTP);
user.get("/loginUser", auth.isLogout, userController.loadsignin);
user.post("/loginUser", auth.isLogout, userController.verifyLogin);
user.get("/logout", auth.isLogin, userController.userLogout);

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

user.get("/shop", userController.loadshop);
user.get("/singleproduct", userController.singleproduct);

module.exports = user;
