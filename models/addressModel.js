const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const addressSchema = new mongoose.Schema({
  user: {
    type: objectId,
    ref: "User",
    required: true,
  },
  address: [
    {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postcode: {
        type: String,
        required: true,
      },
      mobile: {
        type: Number,
        required: true,
      },
      
    },
  ],
});

const addressModel = mongoose.model("addressModel", addressSchema);
module.exports = addressModel;
