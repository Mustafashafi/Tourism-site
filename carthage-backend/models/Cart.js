const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  options: {
    type: Object,
    default: {},
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// Remove unique constraint on _id for subdocuments just in case we need it, but mongoose adds it by default
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
