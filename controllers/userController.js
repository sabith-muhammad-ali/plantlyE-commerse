const User = require("../models/userModel");
const UserOTPVerfication = require("../models/OTPModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const productModel = require("../models/productModel");

// tempHomePage
const homePage = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.userId });
    res.render("user/home", { userData });
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

// User registration page
const loadRegister = async (req, res) => {
  try {
    res.render("user/registration");
  } catch (error) {
    console.log(error.message);
  }
};

// User registration handler
const insertUser = async (req, res) => {
  try {
    const sPassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.fname,
      email: req.body.email,
      mobile: req.body.mobile,
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
    const hashedOTP = await bcrypt.hash(otp.toString(), saltRounds); // Convert OTP to string before hashing
    new UserOTPVerfication({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    }).save();

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
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadshop = async (req, res) => {
  try {
    const product = await productModel.find({});
    res.render("user/shop", { product });
  } catch (error) {
    console.log(error);
  }
};

const singleproduct = async (req, res) => {
  try {
    console.log("hello");
    const id = req.query.id;
    console.log(id);

    const product = await productModel.findById({ _id: id });
    console.log(product);
    res.render("user/singleProduct", { product });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  homePage,
  loadRegister,
  insertUser,
  sendOTP,
  verifyOTP,
  loadsignin,
  verifyLogin,
  userLogout,
  loadshop,
  singleproduct,
};
