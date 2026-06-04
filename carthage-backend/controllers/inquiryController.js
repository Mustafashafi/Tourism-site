const Inquiry = require("../models/Inquiry");
const { sendInquiryEmail } = require("../utils/emailService");

exports.submitInquiry = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      doNotSendOffers,
      productId,
      productName,
      remarks,
      bookingDetails,
    } = req.body;

    // Basic validation
    if (!fullName || !phoneNumber || !email || !productId || !productName) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // 1. Save to Database
    const newInquiry = new Inquiry({
      fullName,
      phoneNumber,
      email,
      doNotSendOffers,
      productId,
      productName,
      remarks,
      bookingDetails,
    });

    await newInquiry.save();

    // 2. Send Email
    try {
      await sendInquiryEmail(req.body);
    } catch (emailError) {
      console.error("Failed to send inquiry email:", emailError);
      // We don't fail the request if email fails, but we log it.
    }

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully.",
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({ message: "Server error while submitting inquiry." });
  }
};
