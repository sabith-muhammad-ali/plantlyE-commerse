const passport = require("passport");
require("dotenv").config();
const User = require("../models/userModel");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const bcrypt = require("bcrypt");
const productModel = require("../models/productModel");
const Cart = require("../models/cartModel");
const bannerModel = require("../models/bannerModel");
const couponModel = require("../models/couponModel");
const categoryModel = require("../models/categoryModel");
const offerModel = require("../models/offerModel");
const WalletModel = require("../models/walletModel");


//  referral code generating
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function generateUniqueReferralCode() {
  let uniqueCode;
  let codeExists = true;

  while (codeExists) {
    uniqueCode = generateReferralCode();

    const existingUser = await User.findOne({ referralCode: uniqueCode });
    if (!existingUser) {
      codeExists = false;
    }
  }

  return uniqueCode;
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://plantlygreen.online/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const success = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.user.email });
    const referralCode = await generateReferralCode();
    if (existingUser) {
      if (existingUser.is_block === true) {
        return res.redirect("/login-User");
      }
      req.session.userId = existingUser._id;
      return res.redirect("/");
    } else {
      const sPassword = await securePassword(req.user.id);
      const newUser = new User({
        name: req.user.displayName,
        email: req.user.email,
        mobile: 0,
        varified: true,
        password: sPassword,
        varified: true,
        is_admin: false,
        is_block: false,
        google: true,
        facebook: false,
      });
      const savedUser = await newUser.save();

      if (savedUser) {
        req.session.userId = savedUser._id;
        const wallet = new WalletModel({ userId:  savedUser._id  });

        await wallet.save();
      }

      await User.updateOne(
        { _id: savedUser._id },
        { varified: true, referralCode: referralCode }
      );

      const referral = req.session.referralCode;
      if (referral) {
        await handelRefferal(referral, req.session.userId);
      }
      


      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
};

//referralOffer
async function handelRefferal(referralCode, userId) {
  try {
  
    if (!referralCode) {
      return;
    }
    const referrer = await User.findOne({ referralCode: referralCode });
    if (!referrer) {
      return;
    }
  
    const refTransaction = {
      reason:"Referral Reward",
      transaction:"Credited",
      amount:80,
      date:new Date(),
    };
  
    const recipientTransaction = {
      reason:"SignUp Referral Bonus",
      transaction:"Credited",
      amount:40,
      date:new Date(),
    }
  
    let referrerId = referrer._id;
    const referrerFunds = await walletModel.findOne({userId:referrerId});
    referrerFunds.history.push(refTransaction)
    referrerFunds.amount += 80
    await referrerFunds.save();
  
    const newUserBalance = await walletModel.findOne({userId:userId})
    newUserBalance.history.push(recipientTransaction);
    newUserBalance.amount += 40;
    await newUserBalance.save();
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  success,
};
