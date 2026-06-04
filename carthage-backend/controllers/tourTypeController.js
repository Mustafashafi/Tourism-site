const mongoose = require("mongoose");
const TourType = require("../models/TourType");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizePayload = (payload) => {
  const normalized = { ...payload };
  if (normalized.name) normalized.name = String(normalized.name).trim();
  if (normalized.slug) normalized.slug = String(normalized.slug).trim().toLowerCase();
  return normalized;
};

exports.createTourType = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required." });
    }

    const tourType = await TourType.create(normalizePayload({ name, slug }));
    return res.status(201).json({
      message: "Tour Type created successfully.",
      data: tourType,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Tour Type name or slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to create Tour Type." });
  }
};

exports.getTourTypes = async (req, res) => {
  try {
    const docs = await TourType.find().sort({ name: 1 });
    return res.status(200).json({ data: docs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch Tour Types." });
  }
};

exports.getTourTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Tour Type id." });
    }

    const doc = await TourType.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Tour Type not found." });
    }
    return res.status(200).json({ data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch Tour Type." });
  }
};

exports.updateTourType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Tour Type id." });
    }

    const updated = await TourType.findByIdAndUpdate(
      id,
      { $set: normalizePayload(req.body) },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Tour Type not found." });
    }

    return res.status(200).json({
      message: "Tour Type updated successfully.",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Tour Type name or slug already exists." });
    }
    return res.status(500).json({ message: "Failed to update Tour Type." });
  }
};

exports.deleteTourType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Tour Type id." });
    }

    const deleted = await TourType.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Tour Type not found." });
    }

    return res.status(200).json({ message: "Tour Type deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete Tour Type." });
  }
};
