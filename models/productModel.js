const mongoose = require("mongoose");
const categoryModel = require("./categoryModel");
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
    ref: "categoryModel",
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
  images: {
    image1: {
      type: String,
    },
    image2: {
      type: String,
    },
    image3: {
      type: String,
    },
  },
  is_blocked: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const product = mongoose.model("product", productSchema);
module.exports = product;
