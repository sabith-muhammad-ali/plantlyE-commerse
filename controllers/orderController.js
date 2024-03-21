const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cartModel = require("../models/cartModel");

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cartData = await cartModel.findOne({ user: userId }).populate("items.productId");
    const addressData = await addressModel.findOne({user: req.session.userId,});
    const subtotal = cartData.items.reduce((acc,val) => acc + val.orginalTotal,0);
    console.log(subtotal);
    console.log(cartData,addressData);
    res.render("user/checkOut", { addressData, cartData, });
  } catch (error) {
    console.log(error);
  }
};

const checkoutAddAddress = async (req, res) => {
  try {
    const { name, address, state, city, postcode, mobile } = req.body;

    const Address = {
      name: name,
      address: address,
      state: state,
      city: city,
      postcode: postcode,
      mobile: mobile,
    };

    await addressModel.findOneAndUpdate(
      { user: req.session.userId },
      { $push: { address: Address } },
      { upsert: true, new: true }
    );
    res.redirect("/checkOut");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCheckout,
  checkoutAddAddress,
};
