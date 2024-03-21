const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

const loadCheckout = async (req, res) => {
  try {
    const addressData = await addressModel.findOne({
      user: req.session.userId,
    });
    res.render("user/checkOut", { addressData });
  } catch (error) {
    console.log(error);
  }
};

const editCheckOutAddress = async (req,res) => {
  try {
    
  } catch (error) {
    
  }
} 

module.exports = {
  loadCheckout,
};
