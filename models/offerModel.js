const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  activationDate: {
    type: Date,
    default: Date.now,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const OfferModel = mongoose.model("Offer", offerSchema);
module.exports =   OfferModel;
