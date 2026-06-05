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
    faq: [
      {
        question: { type: String, default: "" },
        answer: { type: String, default: "" },
      },
    ],
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
    // SMTP configurations
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      user: { type: String, default: "" },
      pass: { type: String, default: "" },
      secure: { type: Boolean, default: false },
      fromEmail: { type: String, default: "" },
      fromName: { type: String, default: "" },
    },
    // Logo assets paths
    logos: {
      headerLogoLight: { type: String, default: "" },
      headerLogoDark: { type: String, default: "" },
      footerLogo: { type: String, default: "" },
      favicon: { type: String, default: "" },
    },
    // Homepage curated items lists
    homepageCuration: {
      activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      cruises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      holidays: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    // Notification templates
    emailTemplates: {
      newBookingAdmin: {
        subject: { type: String, default: "New Booking Received - {{bookingId}}" },
        body: { type: String, default: "Hello Admin,\n\nA new booking has been placed. Details:\nID: {{bookingId}}\nCustomer: {{customerName}}\nTotal: {{totalAmount}} AED\n\nBest regards,\nCarthage System" },
      },
      newBookingCustomer: {
        subject: { type: String, default: "Your Carthage Booking Confirmation - {{bookingId}}" },
        body: { type: String, default: "Dear {{customerName}},\n\nThank you for booking with Carthage Travel & Tourism!\nYour Booking ID is {{bookingId}}.\nTotal Amount: {{totalAmount}} AED.\nPayment: {{paymentMethod}}.\n\nEnjoy your trip!\nCarthage Team" },
      },
      bookingCompleted: {
        subject: { type: String, default: "Booking Completed! - {{bookingId}}" },
        body: { type: String, default: "Dear {{customerName}},\n\nYour Carthage Travel booking {{bookingId}} is marked as completed.\nWe hope you had an amazing experience!\n\nBest regards,\nCarthage Team" },
      },
    },
    // CMS Site contents
    siteContent: {
      aboutUs: {
        title: { type: String, default: "About Carthage Travel" },
        content: { type: String, default: "Your premier travel partner in the UAE." },
        mission: { type: String, default: "To deliver unmatched UAE travel experiences." },
        vision: { type: String, default: "To become the lead destination explorer in the Middle East." },
        heroImageUrl: { type: String, default: "" },
        sectionImageUrl: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
