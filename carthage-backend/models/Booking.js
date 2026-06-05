const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be guest checkout
    },
    customerDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        transferOption: {
          type: String,
          required: false,
        },
        guests: {
          adult: { type: Number, default: 1 },
          child: { type: Number, default: 0 },
          infant: { type: Number, default: 0 },
        },
        price: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        }
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "etihad", "spot"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["new", "in_progress", "completed", "cancelled"],
      default: "new",
    },
    pickupLocation: {
      type: String,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ bookingStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", BookingSchema);
