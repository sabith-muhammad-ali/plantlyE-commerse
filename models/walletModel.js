const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  history: [
    {
      reason: {
        type: String,
      },
      amount: {
        type: Number,
      },
      transaction: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);
