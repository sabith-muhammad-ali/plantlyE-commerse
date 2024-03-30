const userModel = require("../models/userModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cartModel = require("../models/cartModel");
const Razorpay = require("razorpay");

const razorPay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SCRET,
});

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

    const newAddress = {
      name: name,
      address: address,
      state: state,
      city: city,
      postcode: postcode,
      mobile: mobile,
    };

    await addressModel.findOneAndUpdate(
      { user: req.session.userId },
      { $push: { address: newAddress } },
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
    const subtotal = requestBody.subtotal;

    let status =
      paymentMethod == "cash On Delivey" || paymentMethod == "wallet"
        ? "Placed"
        : "Pending";

    const addressDetails = await addressModel.findOne({ user: userId });

    if (!addressDetails) {
      throw new Error("User's address not found");
    }

    const orderAddress = addressDetails.address.find(
      (a) => a._id.toString() === addressId
    );

    const userCart = await cartModel.findOne({ user: userId });

    const currentData = new Date();
    const expectedDate = new Date(currentData);
    expectedDate.setDate(expectedDate.getDate() + 6);

    const orderProducts = userCart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      productStatus: status,
    }));

    const order = new orderModel({
      userId: userId,
      product: orderProducts,
      shippingAddress: {
        name: orderAddress.name,
        address: orderAddress.address,
        state: orderAddress.state,
        city: orderAddress.city,
        postcode: orderAddress.postcode,
        mobile: orderAddress.mobile,
      },
      paymentMethod: paymentMethod,
      expectedDate: expectedDate,
      Total: subtotal,
    });

    await order.save();
    const orderId = order._id
    req.session.orderId = orderId

    // Update product quantities
    for (const item of userCart.items) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    await cartModel.deleteOne({ user: userId });


    let options = {
      amount:subtotal,
      currency:'INR',
      receipt:orderId
    };
      razorPay.orders.create(options, function(err,order) {
        console.log("razorpay order:",order);
        res.json({})
      })

    res.status(200).json({ message: "Order received successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const showOrder = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderDetails = await orderModel
      .find({ userId: userId })
      .populate("product.productId");
    res.render("user/viewOrder", { orderDetails });
  } catch (error) {
    console.log(error);
  }
};

const cancelOrders = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    await orderModel.updateOne(
      { _id: orderId, "product.productId": productId },
      { $set: { "product.$.productStatus": "cancelled" } }
    );

    const order = await orderModel.findById({ _id: orderId });
    const cancelledOrder = order.product.find(
      (p) => p.productId == productId
    ).quantity;
    console.log("cancelledOrder", cancelledOrder);

    //update quantity after cancell
    await productModel.findByIdAndUpdate(
      { _id: productId },
      { $inc: { quantity: cancelledOrder } }
    );

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

const successsPage = async (req, res) => {
  try {
    res.render("user/successPage");
  } catch (error) {
    console.log(error);
  }
};

const viewOrderDetails = async (req, res) => {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId;
    const order = await orderModel
      .findOne({ userId: userId, _id: orderId })
      .populate("product.productId");
    res.render("user/viewDetails", { order });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCheckout,
  checkoutAddAddress,
  placeOrder,
  showOrder,
  cancelOrders,
  successsPage,
  viewOrderDetails,
};
