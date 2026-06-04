const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    // "Best Cities" fields (admin-controlled)
    city_name: { type: String, trim: true, minlength: 2, maxlength: 100 },
    country_name: { type: String, trim: true, minlength: 2, maxlength: 120 },
    image: { type: String, trim: true, default: "" },
    // Allow a city to appear in multiple sections/pages
    categories: {
      type: [String],
      default: [],
      set(value) {
        const arr = Array.isArray(value) ? value : value ? [value] : [];
        return arr
          .map((v) => String(v || "").trim().toLowerCase())
          .filter(Boolean);
      },
    },
    status: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["active", "inactive"],
      default: "active",
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    banners: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

citySchema.index({ name: 1 }, { unique: true });
citySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);
