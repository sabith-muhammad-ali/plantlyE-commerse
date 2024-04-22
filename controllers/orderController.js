const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");
const walletModel = require("../models/walletModel");
const userModel = require("../models/userModel");
const offerModel = require("../models/offerModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs");

const razorPay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SCRET,
});

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const currentData = new Date();
    const cartData = await cartModel
    .findOne({ user: userId })
    .populate({
      path: "items.productId",
      populate: {
        path: "offer",
        model: "Offer"
      }
    })
    .populate("couponDiscount");
      

    const addressData = await addressModel.findOne({
      user: req.session.userId,
    });

    let subtotal = 0;
    let totalDiscountAmount = 0;
    cartData.items.forEach((val) => {
      if (val.productId.offer && val.productId.offer.discountAmount) {
        // If Apply Product Offer
        subtotal += (val.productId.price - val.productId.offer.discountAmount) * val.quantity;
        totalDiscountAmount += val.productId.offer.discountAmount * val.quantity;
      } else {
        if (val.productId.categoryDiscount) {
          // If Apply category Offer
          subtotal += (val.productId.price - val.productId.categoryDiscount) * val.quantity;
          totalDiscountAmount += val.productId.categoryDiscount * val.quantity;
        } else {
          subtotal += val.productId.price * val.quantity;
        }
      }
    });
    const couponData = await couponModel.find({
      expiryDate: { $gte: currentData },
      isBlocked: false,
    });

    const walletData = await walletModel.findOne({ userId: userId });

    res.render("user/checkOut", {
      addressData,
      cartData,
      subtotal,
      totalDiscountAmount,
      couponData,
      walletData,
    });
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
    const discountAmount = requestBody.discountAmount;

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

    const orderProducts = [];
    for (const item of userCart.items) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      orderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price * item.quantity,
        productStatus: status,
      });
    }

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
      discountAmount:discountAmount,
    });

    await order.save();
    const orderId = order._id;
    req.session.orderId = orderId;

    // Update product quantities
    if (paymentMethod === "cash On Delivey") {
      for (const item of userCart.items) {
        await productModel.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity, popularity: 1 },
        });
      }
      await cartModel.deleteOne({ user: userId });
    } else if (paymentMethod === "wallet") {
      const data = {
        amount: subtotal,
        reason: "Order Placed",
        transaction: "Debit",
      };

      const walletData = await walletModel.findOne({ userId: userId });
      walletData.history.push(data);
      walletData.amount -= subtotal;
      await walletData.save();

      await orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { productStatus: "Placed" } }
      );

      for (const item of userCart.items) {
        await productModel.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity, popularity: 1 },
        });
      }
      await cartModel.deleteOne({ user: userId });
    }

    if (paymentMethod === "razorPay") {
      let options = {
        amount: subtotal * 100,
        currency: "INR",
        receipt: orderId,
      };
      razorPay.orders.create(options, function (err, order) {
        if (err) {
          console.log("err:", err);
          res.status(500).json({ error: "Error creating Razorpay order" });
        } else {
          return res.json({ success: true, response: "razorpay", order });
        }
      });
    } else {
      return res.json({
        success: true,
        message: "Order received successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { response, order } = req.body;

    const cartData = await cartModel
      .findOne({ user: userId })
      .populate("items.productId");

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SCRET);

    hmac.update(
      response.razorpay_order_id + "|" + response.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    const orderId = order.receipt;

    const orderData = await orderModel.findById(orderId);

    const productStatusChange = [];
    for (const item of orderData.product) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      productStatusChange.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price * item.quantity,
        productStatus: "Placed",
      });
    }


    await orderModel.findByIdAndUpdate(
      { _id: orderId },
      { $set: { product: productStatusChange } }
    );

    // decreasing ordered products quantiy
    if (hmacValue == response.razorpay_signature) {
      for (const data of cartData.items) {
        const { productId, quantity } = data;
        await productModel.findByIdAndUpdate(productId, {
          $inc: { quantity: -quantity, popularity: 1 },
        });
      }
      res.json({ statusChanged: true, orderId });
    }

    await cartData.deleteOne({ user: userId });
  } catch (error) {
    console.log(error);
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
    const { orderId, productId, status } = req.body;
    const userId = req.session.userId;
    await orderModel.updateOne(
      { _id: orderId, "product.productId": productId },
      { $set: { "product.$.productStatus": status } }
    );

    const order = await orderModel.findById({ _id: orderId });
    const cancelledOrder = order.product.find(
      (p) => p.productId == productId
    ).quantity;

    //update quantity after cancell
    await productModel.findByIdAndUpdate(
      { _id: productId },
      { $inc: { quantity: cancelledOrder } }
    );

    if (order.paymentMethod === "razorPay" || order.payment === "wallet") {
      const orderDetails = await orderModel.findOne({ _id: orderId });
      const productPrice = orderDetails.product.find(
        (p) => p.productId == productId
      ).price;

      await walletModel.updateOne(
        { userId: userId },
        { $inc: { amount: productPrice } }
      );

      await walletModel.updateOne(
        { userId: userId },
        {
          $push: {
            history: {
              Reason: "For Proudct Cancelled",
              amount: productPrice,
              transaction: "Credited",
              date: new Date(),
            },
          },
        }
      );
    }

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

const returnOrder = async (req, res) => {
  try {
    const { orderId, status, productId } = req.body;
    const userId = req.session.userId;
    await orderModel.updateOne(
      { _id: orderId, "product.productId": productId },
      { $set: { "product.$.productStatus": status } }
    );
    const order = await orderModel.findById({ _id: orderId });
    const returnedOrder = order.product.find(
      (p) => p.productId == productId
    ).quantity;

    // update quantity after returned product
    await productModel.findByIdAndUpdate(
      { _id: productId },
      { $inc: { quantity: returnedOrder } }
    );

    if (order.paymentMethod === "razorPay" || order.payment === "wallet") {
      const product = await orderModel.findOne({ _id: orderId });
      const productPrice = product.product.find(
        (p) => p.productId == productId
      ).price;

      await walletModel.updateOne(
        { userId: userId },
        { $inc: { amount: productPrice } }
      );

      await walletModel.updateOne(
        { userId: userId },
        {
          $push: {
            history: {
              Reason: "For Proudct Returned",
              amount: productPrice,
              transaction: "Credited",
              date: new Date(),
            },
          },
        }
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

const loadWallet = async (req, res) => {
  try {
    const userId = req.session.userId;
    const walletData = await walletModel
      .findOne({ userId: userId })
      .populate("userId");
    res.render("user/wallet", { walletData });
  } catch (error) {
    console.log(error);
  }
};

const invoice = async (req, res) => {
  try {
    const { orderId, productId } = req.query;


    const orderData = await orderModel
      .findById({ _id: orderId })
      .populate("product.productId");


    const date = new Date();
    const orderDetails = {
      orderData,
      date,
      baseUrl: "http://" + req.headers.host,
    };
    const filepath = path.resolve(__dirname, "../views/user/invoice.ejs");
    const htmlTemplate = fs.readFileSync(filepath, "utf-8");
    const invoiceHtml = ejs.render(htmlTemplate, orderDetails);

    const updatedHtml = invoiceHtml.replace(
      /src="\/public\/assets\/img\/([^"]*)"/g,
      (match, src) => {
        const imageFile = fs.readFileSync(
          path.resolve(__dirname, "../public/assets/img", src)
        );
        const base64Image = imageFile.toString("base64");
        return `src="data:image/png;base64,${base64Image}"`;
      }
    );

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(updatedHtml, { waitUntil: "networkidle0" });

    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename = Plantly-Invoice.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in generating invoice");
  }
};

const rePayment = async (req,res) => {
  try {
    const {orderId, totalAmount} = req.body;
    console.log("req.body:",req.body);

    let options = {
      amount: subtotal * 100,
      currency: "INR",
      receipt: orderId,
    };
    razorPay.orders.create(options, function (err, order) {
      if (err) {
        console.log("err:", err);
        res.status(500).json({ error: "Error creating Razorpay order" });
      } else {
        return res.json({ success: true, response: "razorpay", order });
      }
    });
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  loadCheckout,
  checkoutAddAddress,
  placeOrder,
  verifyPayment,
  showOrder,
  cancelOrders,
  successsPage,
  viewOrderDetails,
  returnOrder,
  loadWallet,
  invoice,
  rePayment
};
