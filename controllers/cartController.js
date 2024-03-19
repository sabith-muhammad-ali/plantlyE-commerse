const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");


const getCart = async (req, res) => {
  try {
    if (req.session.userId) {
      const product_id = req.body.product;
      const userId = req.session.userId;
      const productData = await Product.findById(product_id);
      const cartProduct = await Cart.findOne({
        user: userId,
        "items.productId": product_id,
      });

      if (productData.quantity > 0) {
        if (cartProduct) {
          res.json({ status: "already Added", cartProduct });
        } else {
          const data = {
            productId: product_id,
            price: productData.price,
            total: productData.price,
          };
          await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { user: userId }, $push: { items: data } },
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
      const cartData = await Cart.findOne({ user: id }).populate(
        "items.productId"
      );

      res.render("user/cart-load", { data: cartData, id });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.session.userId;
    const product_id = req.body.productId;
    const count = req.body.count;
    const productCount = await Product.findOne({ _id: product_id });
    const cartData = await Cart.findOne({ user: userId });
    let currentQuantity;


    if (count === -1) {
      currentQuantity = cartData.items.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentQuantity + count < 1) {
        return res.json({
          response: false,
          message: "Quantity cannot be decreased further.",
        });
      }
    }

    if (count === 1) {
      currentQuantity = cartData.items.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentQuantity + count > 5) {
        return res.json({ response: false, message: "Stock limit reached" });
      }
    }

    await Cart.findOneAndUpdate(
      { user: userId, "items.productId": product_id },
      {
        $inc: {
          "items.$.quantity": count,
        },
      },
      { new: true }
    );
    res.json({ response: true });
  } catch (error) {
    console.log(error);
  }
};

const removeCart = async (req, res) => {
  try {
    console.log("hello");
    const userId = req.session.userId;
    const product_id = req.body.productId;
    console.log(userId, product_id, 'fffffffffffff');

    if (!userId || !product_id) {
      return res.status(400).json({ error: "Invalid user ID or product ID" });
    }

    const cartData = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId: product_id } } },
      { new: true }
    );
    console.log(cartData);
    if (cartData) {
      res.json({ response: true });
    } else {
      res.status(404).json({ error: "Product not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  cartLoad,
  getCart,
  updateCartQuantity,
  removeCart,
};
