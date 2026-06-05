const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    privacyPolicy: { type: String, default: "" },
    termsAndConditions: { type: String, default: "" },
    refundPolicy: { type: String, default: "" },
    contactDetails: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    stripe: {
      publicKey: { type: String, default: "" },
      secretKey: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
    },
    paypal: {
      clientId: { type: String, default: "" },
      clientSecret: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
    },
    etihadPay: {
      merchantId: { type: String, default: "" },
      apiKey: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
