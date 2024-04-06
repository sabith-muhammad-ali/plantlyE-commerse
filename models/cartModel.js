const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  couponDiscount: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Coupon",
    default: null,
  }
});

module.exports = mongoose.model("Cart", cartSchema);
