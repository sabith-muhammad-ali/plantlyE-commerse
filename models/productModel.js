const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  categoryId: {
    type: ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offer: {
    type: ObjectId,
    ref: "offerModel",
  },
  discountPrice: Number,
  description: {
    type: String,
    required: false,
  },
  images: [String],

  is_blocked: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const product = mongoose.model("product", productSchema);
module.exports = product;
