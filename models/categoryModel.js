const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId


const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  offer: {
    type: ObjectId,
    ref: "Offer",
  },
  
  is_block: {
    type: Boolean,
    required: true,
  },
});
module.exports = mongoose.model("Category", categorySchema);
