const User = require("../models/userModel");
const UserOTPVerfication = require("../models/OTPModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const productModel = require("../models/productModel");
const crypto = require("crypto");
const Cart = require("../models/cartModel");
const bannerModel = require("../models/bannerModel");

// tempHomePage
const homePage = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.userId });
    const banner = await bannerModel.find({})
    res.render("user/home", { userData,banner });
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("user/registration");
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const sPassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.fname,
      email: req.body.email,
      varified: false,
      password: sPassword,
      is_admin: false,
      is_block: false,
      google: false,
      facebook: false,
    });
    const userData = await user.save();
    await sendOTPVerificationEmail(userData, res);
    if (userData) {
      let id = userData._id;
      res.redirect(`/userOTP?userid=${id}`);
    } else {
      res.render("registration", { message: "Your registration has failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// sending OTP verification email
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    // Mail options
    const mailOptions = {
      from: process.env.user_email,
      to: email,
      subject: "Verify your email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the size</p>`,
    };
    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp.toString(), saltRounds);

    const userOTPVerificationRecord = await UserOTPVerfication.findOne({
      userId: _id,
    });
    if (userOTPVerificationRecord) {
      await UserOTPVerfication.updateOne(
        { userId: _id },
        { otp: hashedOTP, createdAt: Date.now() }
      );
    } else {
      new UserOTPVerfication({
        userId: _id,
        otp: hashedOTP,
        createdAt: Date.now(),
      }).save();
    }

    await transporter.sendMail(mailOptions);
    console.log("otp verification email sent successfully");
  } catch (error) {
    console.error(error);
    res.render("registration", { message: "your registration has faileed" });
  }
};

let transporter = nodemailer.createTransport({
  host: "Smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.user_email,
    pass: process.env.app_password,
  },
});

const sendOTP = async (req, res) => {
  try {
    const userId = req.query.userid;
    res.render("user/userOTP", { userId });
  } catch (error) {
    console.log(error);
  }
};

// resend OTP
const resendOtp = async (req, res) => {
  try {
    const Id = req.query.userId;
    const userData = await User.findOne({ _id: Id });
    await sendOTPVerificationEmail(
      { email: userData.email, _id: userData._id },
      res
    );
  } catch (error) {
    console.log("error in resendOTP", error);
  }
};

// User OTP verification page
const verifyOTP = async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerficationRecords = await UserOTPVerfication.findOne({
        userId: userId,
      });
      if (!UserOTPVerficationRecords) {
        // no record found
        throw new Error(
          "Account record dosnt exist or has been verified already .please sign up or log in"
        );
      } else {
        // user OTP record exists
        const { expiresAt } = UserOTPVerficationRecords;
        const hashedOTP = UserOTPVerficationRecords.otp;

        if (expiresAt < Date.now()) {
          //user OTP record has expired
          await UserOTPVerfication.deleteMany({ userId });
          throw new Error("code has expired. please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // suplied otp is wrong
            res.render("user/userOTP", { message: "invalid OTP", userId });
          } else {
            // sucess
            await User.updateOne({ _id: userId }, { varified: true });
            await UserOTPVerfication.deleteMany({ userId });
            req.session.userId = userId;

            res.redirect(`/`);
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// login Uer
const loadsignin = async (req, res) => {
  try {
    res.render("user/loginUser");
  } catch (error) {
    console.log(error);
  }
};

// verifyLogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (!userData.is_block) {
          req.session.userId = userData._id;
          res.redirect("/");
        } else {
          res.render("user/loginUser", {
            message: "you are blocked user",
          });
        }
      } else {
        res.render("user/loginUser", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      res.render("user/loginUser", {
        message: "Email and password is incorrect",
      });
    }
  } catch (error) {
    res.render("user/loginUser", {
      message: "An error occurred while verifying login",
    });
  }
};

// userLogout
const userLogout = async (req, res) => {
  try {
    req.session.userId = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadshop = async (req, res) => {
  try {
    let product;
    product = await productModel.find({});
    if (req.query.sort === "high to low") {
      product = await productModel.find({}).sort({ price: -1 });
    } else if (req.query.sort === "low to high") {
      product = await productModel.find({}).sort({ price: 1 });
    } else if (req.query.sort === "A to Z") {
      product = await productModel.find({}).sort({ name: 1 });
    } else if (req.query.sort === "Z to A") {
      product = await productModel.find({}).sort({ name: -1 });
    }

    const cart = await Cart.find({}).populate("items.productId");
    res.render("user/shop", { product, cart });
  } catch (error) {
    console.log(error);
  }
};

const singleproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await productModel.findById({ _id: id });
    res.render("user/singleProduct", { product });
  } catch (error) {
    console.log(error);
  }
};

const userProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    res.render("user/userProfile", { user });
  } catch (error) {
    console.log(error);
  }
};

const editUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userId });
    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { name: req.body.name, mobile: req.body.mobile } },
      { new: true }
    );
    res.redirect("/user-profile");
  } catch (error) {
    console.log(error);
  }
};

const loadChangePassword = async (req, res) => {
  try {
    res.render("user/changepassword");
  } catch (error) {
    console.log(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currPass, changePass } = req.body;
    const id = req.session.userId;
    const user = await User.findById(id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isPasswordMatch = await bcrypt.compare(currPass, user.password);

    if (!isPasswordMatch) {
      return res.json({
        success: false,
        message: "current password is not matching ",
      });
    }
    const hashedPassword = await bcrypt.hash(changePass, 10);
    await User.findOneAndUpdate(
      { _id: id },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const loadForgerPassword = async (req, res) => {
  try {
    res.render("user/forgetPassword");
  } catch (error) {
    console.log(error);
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else if (user.is_block) {
      return res
        .status(404)
        .json({ success: false, message: "sorry, you are blocked user " });
    } else {
      const token = crypto.randomBytes(20).toString("hex");
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 300000;
      await user.save();

      const resetLink = `http://localhost:3001/reset-Password/${token}`;
      const resetMail = {
        from: process.env.user_email,
        to: email,
        subject: "Reset Password",
        html: `
        <p>Dear User,</p>
        <p>We received a request to reset your password. Click the following link to proceed:</p>
        <p><a href="${resetLink}" style="text-decoration: none; color: #007BFF; font-weight: bold;">Reset Your Password</a></p>
        <p>If you didn't initiate this request, please ignore this email.</p>
        <p>Thank you,</p>
        <p>Plantly</p>
         `,
      };
      await transporter.sendMail(resetMail);
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const loadRestPassword = async (req, res) => {
  try {
    const token = req.params.token;
    res.render("user/password", { token });
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.body.token;
    const newPassword = req.body.password;

    const user = await User.findOne({ resetToken: req.body.token });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newpasswordHash = await bcrypt.hash(newPassword, 10);

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.json({
        error: "Your old password and new password are the same!",
      });
    } else {
      user.password = newpasswordHash;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  homePage,
  loadRegister,
  insertUser,
  sendOTP,
  resendOtp,
  verifyOTP,
  loadsignin,
  verifyLogin,
  userLogout,
  loadshop,
  singleproduct,
  userProfile,
  editUserProfile,
  loadChangePassword,
  changePassword,
  loadForgerPassword,
  checkEmail,
  loadRestPassword,
  resetPassword,
};
