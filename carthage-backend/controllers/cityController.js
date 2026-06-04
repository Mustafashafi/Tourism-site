const mongoose = require("mongoose");
const City = require("../models/City");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizePayload = (payload) => {
  const normalized = { ...payload };
  if (normalized.name) normalized.name = String(normalized.name).trim();
  if (normalized.city_name) normalized.city_name = String(normalized.city_name).trim();
  if (normalized.country_name) normalized.country_name = String(normalized.country_name).trim();
  if (normalized.image != null) normalized.image = String(normalized.image || "").trim();
  // Back-compat: accept category string and map to categories array
  if (normalized.category) normalized.category = String(normalized.category).trim().toLowerCase();
  if (normalized.categories != null) {
    const arr = Array.isArray(normalized.categories)
      ? normalized.categories
      : normalized.categories
      ? [normalized.categories]
      : [];
    normalized.categories = arr
      .map((v) => String(v || "").trim().toLowerCase())
      .filter(Boolean);
  } else if (normalized.category) {
    normalized.categories = [normalized.category];
  }
  if (normalized.status) normalized.status = String(normalized.status).trim().toLowerCase();

  // Keep name <-> city_name in sync for backwards compatibility
  if (!normalized.name && normalized.city_name) normalized.name = normalized.city_name;
  if (!normalized.city_name && normalized.name) normalized.city_name = normalized.name;

  if (normalized.slug) normalized.slug = String(normalized.slug).trim().toLowerCase();
  if (Array.isArray(normalized.banners)) {
    normalized.banners = normalized.banners
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  return normalized;
};

exports.createCity = async (req, res) => {
  try {
    const {
      name,
      city_name,
      slug,
      banners,
      country_name,
      image,
      category,
      categories,
      status,
    } = req.body;
    const finalName = name || city_name;
    if (!finalName || !slug) {
      return res.status(400).json({ message: "city_name (or name) and slug are required." });
    }

    const city = await City.create(
      normalizePayload({
        name: finalName,
        city_name: city_name || finalName,
        slug,
        banners,
        country_name,
        image,
        category,
        categories,
        status,
      })
    );
    return res.status(201).json({
      message: "City created successfully.",
      data: city,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "City name or slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to create city." });
  }
};

exports.getCities = async (req, res) => {
  try {
    const category = String(req.query?.category || "").trim().toLowerCase();

    // Public fetch for "Best Cities" cards: filter by category & active only
    if (category) {
      const searchCategories = [category];
      if (category === "activity") searchCategories.push("activities");
      if (category === "activities") searchCategories.push("activity");
      if (category === "holiday") searchCategories.push("holidays");
      if (category === "holidays") searchCategories.push("holiday");
      if (category === "cruise") searchCategories.push("cruises");
      if (category === "cruises") searchCategories.push("cruise");

      const docs = await City.find({
        categories: { $in: searchCategories },
        $or: [{ status: "active" }, { status: { $exists: false } }],
      })
        .sort({ name: 1 })
        .select("city_name country_name image categories status name slug");

      const data = docs.map((doc) => ({
        city_name: doc.city_name || doc.name || "",
        country_name: doc.country_name || "",
        image: doc.image || "",
        slug: doc.slug || "",
        categories: Array.isArray(doc.categories) ? doc.categories : [],
        // Back-compat for older frontend clients
        category: Array.isArray(doc.categories) && doc.categories.length > 0 ? doc.categories[0] : category,
        status: doc.status || "active",
      }));

      return res.status(200).json({ data });
    }

    // Admin/default: return full list
    const data = await City.find().sort({ name: 1 });
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cities." });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid city id." });
    }

    const data = await City.findById(id);
    if (!data) {
      return res.status(404).json({ message: "City not found." });
    }
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch city." });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid city id." });
    }

    const updated = await City.findByIdAndUpdate(id, normalizePayload(req.body), {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "City not found." });
    }

    return res.status(200).json({
      message: "City updated successfully.",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "City name or slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to update city." });
  }
};

exports.getCityBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    if (!slug) {
      return res.status(400).json({ message: "Slug is required." });
    }

    const data = await City.findOne({ slug });
    if (!data) {
      return res.status(404).json({ message: "City not found." });
    }
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch city." });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid city id." });
    }

    const deleted = await City.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "City not found." });
    }

    return res.status(200).json({ message: "City deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete city." });
  }
};
