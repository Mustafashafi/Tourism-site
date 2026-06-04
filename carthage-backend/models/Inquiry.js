const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    doNotSendOffers: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    bookingDetails: {
      date: { type: String },
      guests: {
        adult: { type: Number, default: 1 },
        teen: { type: Number, default: 0 },
        kid: { type: Number, default: 0 },
        child: { type: Number, default: 0 },
        infant: { type: Number, default: 0 },
      },
      cabin: { type: String },
      flightStatus: { type: String },
      totalPrice: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
