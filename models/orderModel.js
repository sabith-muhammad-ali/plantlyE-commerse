const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      productStatus:{
        type:String,
        default:'pending',
        enum:['pending', 'placed', 'delivered', 'cancelled', 'shipped', 'out-for-delivery', 'returned']
      },
      cancel: {
        status: { type: String },
        reason: { type: String },
        date: { type: Date },
      },
      return: {
        status: { type: String },
        reson: { type: String },
        date: { type: Date },
      },
    },
  ],
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled","Placed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subTotal: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
