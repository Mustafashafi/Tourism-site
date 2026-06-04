const mongoose = require("mongoose");
const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizePayload = (payload) => {
  const normalized = { ...payload };
  if (normalized.name) normalized.name = String(normalized.name).trim();
  if (normalized.slug) normalized.slug = String(normalized.slug).trim().toLowerCase();
  return normalized;
};

exports.createSubCategory = async (req, res) => {
  try {
    const { name, slug, category } = req.body;
    if (!name || !slug || !category) {
      return res.status(400).json({ message: "name, slug, and category are required." });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const catExists = await Category.exists({ _id: category });
    if (!catExists) {
      return res.status(404).json({ message: "Category not found." });
    }

    const subCategory = await SubCategory.create(normalizePayload({ name, slug, category }));
    const populated = await SubCategory.findById(subCategory._id).populate("category", "name slug");

    return res.status(201).json({
      message: "SubCategory created successfully.",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SubCategory name or slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to create SubCategory." });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      if (isValidObjectId(req.query.category)) {
        filter.category = req.query.category;
      }
    }
    const docs = await SubCategory.find(filter).populate("category", "name slug").sort({ name: 1 });
    return res.status(200).json({ data: docs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch SubCategories." });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid SubCategory id." });
    }

    const doc = await SubCategory.findById(id).populate("category", "name slug");
    if (!doc) {
      return res.status(404).json({ message: "SubCategory not found." });
    }
    return res.status(200).json({ data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch SubCategory." });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid SubCategory id." });
    }

    const payload = normalizePayload(req.body);
    if (payload.category) {
      if (!isValidObjectId(payload.category)) {
        return res.status(400).json({ message: "Invalid category id." });
      }
      const catExists = await Category.exists({ _id: payload.category });
      if (!catExists) {
        return res.status(404).json({ message: "Category not found." });
      }
    }

    const updated = await SubCategory.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!updated) {
      return res.status(404).json({ message: "SubCategory not found." });
    }

    return res.status(200).json({
      message: "SubCategory updated successfully.",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SubCategory name or slug already exists." });
    }
    return res.status(500).json({ message: "Failed to update SubCategory." });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid SubCategory id." });
    }

    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "SubCategory not found." });
    }

    return res.status(200).json({ message: "SubCategory deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete SubCategory." });
  }
};
