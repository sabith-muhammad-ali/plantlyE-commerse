const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");

const cartLoad = async (req,res) => {
    try {
        res.render('user/cart-load');
    } catch (error) {
        
    }
}


module.exports = {
    cartLoad
}