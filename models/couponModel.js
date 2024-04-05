const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
  },
  activationDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  criteriaAmount: {
    type: Number,
    required: true,
  },
  usedUsers: {
    type: Array,
    ref: "User",
    default: [],
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const CouponModel = mongoose.model("Coupon", couponSchema);
module.exports = CouponModel;