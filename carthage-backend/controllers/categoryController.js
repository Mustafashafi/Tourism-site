const mongoose = require("mongoose");
const Category = require("../models/Category");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Converts a single raw banner value (string or object) into the
 * canonical { url, title, subtext, description } shape.
 * Returns null if the value has no usable URL so callers can filter.
 */
const normalizeBanner = (item) => {
  if (!item) return null;

  // Legacy format: plain URL string stored before the object schema was added
  if (typeof item === "string") {
    const url = item.trim();
    return url ? { url, title: "", subtext: "", description: "" } : null;
  }

  // Modern format: object with url + optional text fields
  if (typeof item === "object") {
    const url = String(item.url || item.secure_url || "").trim();
    if (!url) return null;
    return {
      url,
      title: String(item.title || "").trim(),
      subtext: String(item.subtext || "").trim(),
      description: String(item.description || "").trim(),
    };
  }

  return null;
};

/**
 * Normalises the full payload before create / update.
 * Banners are always stored as the canonical object shape.
 */
const normalizePayload = (payload) => {
  const normalized = { ...payload };
  if (normalized.name) normalized.name = String(normalized.name).trim();
  if (normalized.slug) normalized.slug = String(normalized.slug).trim().toLowerCase();
  if (Array.isArray(normalized.banners)) {
    normalized.banners = normalized.banners
      .map(normalizeBanner)
      .filter(Boolean);
  }
  return normalized;
};

/**
 * Converts a Mongoose category document into a plain object where every
 * banner is guaranteed to be in the canonical { url, title, subtext, description }
 * shape — regardless of how it was stored in MongoDB.
 */
const serializeCategory = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.banners = Array.isArray(obj.banners)
    ? obj.banners.map(normalizeBanner).filter(Boolean)
    : [];
  return obj;
};

// ─────────────────────────────────────────────────────────────────────────────

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, banners } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required." });
    }

    const category = await Category.create(normalizePayload({ name, slug, banners }));
    return res.status(201).json({
      message: "Category created successfully.",
      data: serializeCategory(category),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category name or slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to create category." });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const docs = await Category.find().sort({ name: 1 });
    return res.status(200).json({ data: docs.map(serializeCategory) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories." });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const doc = await Category.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ data: serializeCategory(doc) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch category." });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: normalizePayload(req.body) },
      { new: true, runValidators: false }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({
      message: "Category updated successfully.",
      data: serializeCategory(updated),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category name or slug already exists." });
    }
    return res.status(500).json({ message: "Failed to update category." });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete category." });
  }
};
