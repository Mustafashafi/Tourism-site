const mongoose = require("mongoose");

const tourTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourTypeSchema.index({ name: 1 }, { unique: true });
tourTypeSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("TourType", tourTypeSchema);
