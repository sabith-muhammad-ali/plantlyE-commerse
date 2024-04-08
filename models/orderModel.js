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
      price: {
        type:Number,
        required:true
      },
      productStatus:{
        type:String,
        enum:["Pending","Placed","shipped","Delivered","Cancelled","Returned",],
        default: "Pending"
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
  orderedData: {
    type: Date,
    default: Date.now,
  },
  expectedDate: {
    type:Date,
    required: true
  },
  Total: {
    type: Number,
    required: true,
  },
  coupon:{
    type:Number
  }
});

module.exports = mongoose.model("Order", orderSchema);
