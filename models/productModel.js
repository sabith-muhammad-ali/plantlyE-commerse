const mongoose = require("mongoose");
const productListSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  prize: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  is_listed: {
    type: Number,
    default: 0,
  },
  offerName: {
    type: String,
  },
  offerPrice: {
    type: Number,
  },
});
