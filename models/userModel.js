const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  varified: {
    type: Boolean,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Boolean,
    required: true,
  },
  is_block: {
    type: Boolean,
    required: true,
  },
  google: {
    type: Boolean,
  },
  facebook: {
    type: Boolean,
  },
  facebookId: {
    type: String
  }
});
module.exports = mongoose.model("User", userSchema);
