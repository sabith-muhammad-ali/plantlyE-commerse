const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const whislistSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    require: true,
    ref: "User",
  },
  product: [
    {
      productId: {
        type: String,
        required: true,
        ref: "product",
      },
    },
  ],
});

module.exports = mongoose.model("Wishlist", whislistSchema);
