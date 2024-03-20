const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");


const loadCheckOut = async (req, res) => {
    try {
      res.render("user/checkOut");
    } catch (error) {
      console.log(error);
    }
}

module.exports = {
    loadCheckOut,
}