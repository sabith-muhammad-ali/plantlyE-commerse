const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

const product = async (req, res) => {
  try {
    res.render("product");
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
    product,
}