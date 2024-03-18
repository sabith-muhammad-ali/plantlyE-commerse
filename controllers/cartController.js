const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const product = require("../models/productModel");

const getCart = async (req, res) => {
  try {
    if (req.session.userId) {
      console.log("rechead",req.body,req.body.product);
      const product_id = req.body.product;
      const userId = req.session.userId;
      const productData = await Product.findById(product_id);
      const cartProduct = await Cart.findOne({
        user: userId,
        "product.productId": product_id,
      });

      console.log("productData", productData);
      if (productData.quantity > 0) {
        if (cartProduct) {
          res.json({ status: "already Added", cartProduct });
        } else {
          const data = {
            productId: product_id,
            price: productData.price,
            total: productData.price,
          };
          console.log(data);
          await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { user: userId }, $push: { product: data } },
            { upsert: true, new: true }
          );
          res.json({ success: true });
        }
      } else {
        res.json({ stock: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const cartLoad = async (req, res) => {
  try {
    if (req.session.userId) {
      const id = req.session.userId;
      const cartData = await Cart
        .findOne({ user: id })
        .populate("product.productId");
        
      // console.log(product.productId.name);
      console.log(cartData,"cartData");
      
      res.render("user/cart-load", { data: cartData, id });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  cartLoad,
  getCart,
};
