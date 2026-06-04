const Testimonial = require("../models/Testimonial");

exports.getTestimonials = async (req, res) => {
  try {
    const docs = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: docs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
};
