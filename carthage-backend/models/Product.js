const mongoose = require("mongoose");

const textBlockSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 100000,
      default: "",
    },
    icon: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    day: { type: Number },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    step: { type: Number },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const transferOptionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    type: { type: String, enum: ["without_transfer", "shared", "private"], default: "without_transfer" },
    adultPrice: { type: Number, min: 0 },
    childPrice: { type: Number, min: 0, default: 0 },
    infantPrice: { type: Number, min: 0, default: 0 },
    actualPrice: { type: Number, min: 0 }, // For showing discounts if needed
    description: { type: String, trim: true },
  },
  { _id: true }
);

const visaOptionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    processingTime: { type: String, trim: true },
  },
  { _id: true }
);

const cabinOptionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
  },
  { _id: true }
);

const pricingSchema = new mongoose.Schema(
  {
    actualPrice: {
      type: Number,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(value) {
          if (value == null) return true;
          return value <= this.actualPrice;
        },
        message: "discountPrice cannot be greater than actualPrice.",
      },
    },
    childPrice: {
      type: Number,
      min: 0,
    },
    teenPrice: {
      type: Number,
      min: 0,
    },
    kidPrice: {
      type: Number,
      min: 0,
    },
    infantPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "AED",
      minlength: 3,
      maxlength: 3,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    tourType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourType",
    },
    manualCity: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [textBlockSchema],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 220,
    },
    contentSections: {
      type: [textBlockSchema],
      default: [],
    },
    pricing: {
      type: pricingSchema,
    },
    transferOptions: {
      type: [transferOptionSchema],
      default: [],
    },
    visaOptions: {
      type: [visaOptionSchema],
      default: [],
    },
    cabinOptions: {
      type: [cabinOptionSchema],
      default: [],
    },
    processingTypes: {
      type: [String],
      enum: ["Normal", "Express"],
      default: ["Normal", "Express"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    isProductNew: {
      type: Boolean,
      default: false,
    },
    cruiseLine: {
      type: String,
      trim: true,
    },
    departureCity: {
      type: String,
      trim: true,
    },
    itinerary: {
      type: [itinerarySchema],
      default: [],
    },
    duration: {
      type: String,
      trim: true,
    },
    durationInHours: {
      type: Number,
      min: 0,
    },
    durationInDays: {
      type: Number,
      min: 0,
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      focusKeyphrase: { type: String, trim: true },
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    applicationSteps: {
      type: [stepSchema],
      default: [],
    },
    documentsRequired: {
      type: [String],
      default: [],
    },
    guestPolicy: {
      type: String,
      trim: true,
    },
    importantInformation: {
      type: String,
      trim: true,
    },
    faq: {
      type: [faqSchema],
      default: [],
    },
    bookingType: {
      type: String,
      enum: ["book_now", "check_availability", "email", "direct", "inquiry"],
      default: "check_availability",
    },
    mapAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ category: 1, city: 1, subCategory: 1, tourType: 1 });
productSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
