const Testimonial = require("../models/Testimonial");

// Get all testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const docs = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: docs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch testimonials." });
  }
};

// Create a testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { userName, userImage, rating, comment, location } = req.body;
    if (!userName || !comment) {
      return res.status(400).json({ message: "Name and comment are required." });
    }
    const doc = await Testimonial.create({
      userName,
      userImage,
      rating,
      comment,
      location,
    });
    return res.status(201).json({ message: "Testimonial created successfully.", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create testimonial." });
  }
};

// Update a testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, userImage, rating, comment, location } = req.body;
    const doc = await Testimonial.findByIdAndUpdate(
      id,
      { userName, userImage, rating, comment, location },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Testimonial not found." });
    }
    return res.status(200).json({ message: "Testimonial updated successfully.", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update testimonial." });
  }
};

// Delete a testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Testimonial.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ message: "Testimonial not found." });
    }
    return res.status(200).json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete testimonial." });
  }
};
