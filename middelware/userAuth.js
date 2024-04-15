const userModel = require("../models/userModel");
// const isLogin = async (req, res, next) => {
//   try {
//     if (req.session.userId) {
//       next();
//     } else {
//       res.redirect("/login-User");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const isLogin = async (req,res,next) => {
  try {
    if(req.session.userId) {
      const userData = await userModel.findById(req.session.userId);
      if (userData.is_block === true) {
        req.session.userId = null;
        res.redirect("/login-User")
      } else {
        next()
      }
    } else {
      res.redirect("/login-User");
    }
  } catch (error) {
    console.log(error);
  }
}



const isLogout = async (req, res, next) => {
  try {
    if (req.session.userId) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
