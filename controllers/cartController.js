const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");

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
      const cartData = await Cart.findOne({ user: id })
        .populate("items.productId")

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

    if (count === 1) {
      currentQuantity = cartData.items.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentQuantity + count > productCount.quantity) {
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
    const userId = req.session.userId;
    const product_id = req.body.productId;

    if (!userId || !product_id) {
      return res.status(400).json({ error: "Invalid user ID or product ID" });
    }

    const cartData = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId: product_id } } },
      { new: true }
    );
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

//wishlist
const addToWishlist = async (req, res) => {
  try {
    if (req.session.userId) {
      const product_id = req.body.product;
      const userId = req.session.userId;
      const wishlistProduct = await wishlistModel.findOne({
        user: userId,
        "product.productId": product_id,
      });

      if (wishlistProduct) {
        await wishlistModel.findOneAndUpdate(
          { user: userId, "product.productId": product_id },
          { $pull: { product: { productId: product_id } } }
        );

        res.json({ remove: true, productId: product_id });
      } else {
        const data = { productId: product_id };

        await wishlistModel.findOneAndUpdate(
          { user: userId },
          { $addToSet: { product: data } },
          { upsert: true, new: true }
        );

        res.json({ create: true, productId: product_id });
      }
    } else {
      res.json({ user: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadWishlist = async (req, res) => {
  try {
    const wishlistData = await wishlistModel
      .findOne({ user: req.session.userId })
      .populate("product.productId");
    res.render("user/wishlist", { wishlistData });
  } catch (error) {
    console.log(error);
  }
};

const removeWishlist = async (req, res) => {
  try {
    const productId = req.body.product;
    const userId = req.session.userId;
    const removeWishlist = await wishlistModel.findOneAndUpdate(
      { user: userId },
      { $pull: { product: { productId: productId } } },
      { new: true }
    );
    if (removeWishlist) {
      res.json({ remove: true });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  cartLoad,
  getCart,
  updateCartQuantity,
  removeCart,
  addToWishlist,
  loadWishlist,
  removeWishlist,
};
