const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Admin login
const loadLogin = async (req, res) => {
  try {
    res.render("loginAdmin");
  } catch (error) {
    console.log(error);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);

    const userData = await User.findOne({ email: email });
    console.log(userData);

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === false) {
          res.render("loginAdmin", { message: "your not admin" });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/admindashbord");
        }
      } else {
        res.render("loginAdmin", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      res.render("loginAdmin", { message: "you are not admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Admin Dashboard
const loadDashbord = async (req, res) => {
  try {
    res.render("adminDashbord");
  } catch (error) {
    console.log(error.message);
  }
};

//userList
const userManagement = async (req, res) => {
  try {
    const userData = await User.find();

    res.render("userList", { users: userData });
  } catch (error) {
    console.log(error);
  }
};

const blockUser = async (req, res) => {
  try {
    const user = req.params.id;
    console.log(user);
    const value = await User.findOne({ _id: user });
    console.log("hello");
    if (value.is_block) {
      await User.updateOne({ _id: user }, { $set: { is_block: false } });
    } else if (value.is_block == false) {
      await User.updateOne({ _id: user }, { $set: { is_block: true } });
    }
    res.json({ block: true });
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
  loadLogin,
  verifyLogin,
  loadDashbord,
  userManagement,
  blockUser,
  product
};
