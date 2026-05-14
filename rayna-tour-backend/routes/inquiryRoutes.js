const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");

// @route   POST /api/inquiries
// @desc    Submit a new inquiry
router.post("/", inquiryController.submitInquiry);

module.exports = router;
