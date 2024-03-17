const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
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
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
