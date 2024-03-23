const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cartModel = require("../models/cartModel");

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cartData = await cartModel
      .findOne({ user: userId })
      .populate("items.productId");
    const addressData = await addressModel.findOne({
      user: req.session.userId,
    });
    const subtotal = cartData.items.reduce(
      (acc, val) => acc + val.productId.price * val.quantity,
      0
    );
    res.render("user/checkOut", { addressData, cartData, subtotal });
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

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const requestBody = req.body;
    const addressId = requestBody.addressId;
    const paymentMethod = requestBody.paymentMethod;
    const subtotal= requestBody.subtotal
    console.log(subtotal);

    const addressDetails = await addressModel.findOne({ user: userId });
    
    if (!addressDetails) {
      throw new Error("User's address not found");
    }

    const orderAddress = addressDetails.address.find(a => a._id.toString() === addressId);
    console.log("orderAddress", orderAddress);

    const userCart = await cartModel.findOne({ user: userId });
    console.log(userCart, "cart");
    

    const order = new orderModel({
      userId: userId,
      product: userCart.items,
      shippingAddress: {
        name: orderAddress.name,
        address: orderAddress.address,
        state: orderAddress.state,
        city: orderAddress.city, 
        postcode: orderAddress.postcode,
        mobile: orderAddress.mobile
      },
      paymentMethod: paymentMethod,
      paymentStatus: "Placed",
      subTotal: subtotal
    });

    await order.save();
    res.status(200).json({ message: "Order received successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const showCart = async (req,res) => {
  try {
    const userId = req.session.userId
    orderDetails = await orderModel.find({userId:userId}).populate('product.productId');
    res.render("user/viewOrder",{orderDetails});
  } catch (error) {
    console.log(error);
  }
}

const cancelOrders = async (req, res) => {
  try {
    const { orderId, productId, status } = req.body;
    const orderDetatils = await orderModel.updateOne({_id:orderId},
    {$set:{paymentStatus:'cancelled'}})
    console.log(orderDetatils); 
    console.log(data);
  } catch (error) {
    
  }
}
module.exports = {
  loadCheckout,
  checkoutAddAddress,
  placeOrder,
  showCart,
  cancelOrders
};
