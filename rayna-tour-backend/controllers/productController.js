const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const City = require("../models/City");
const CityPoint = require("../models/CityPoint");

const PRODUCT_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "city", select: "name slug" },
  { path: "cityPoint", select: "name slug" },
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeTextBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .filter((item) => item && (item.title || item.description))
    .map((item) => ({
      title: String(item.title || "").trim(),
      description: String(item.description || "").trim(),
      icon: String(item.icon || "").trim(),
    }));
};

const normalizePayload = (payload) => {
  const normalized = { ...payload };

  if (normalized.slug) {
    normalized.slug = String(normalized.slug).trim().toLowerCase();
  }

  if (Array.isArray(normalized.images)) {
    normalized.images = normalized.images
      .map((image) => String(image).trim())
      .filter(Boolean);
  }

  if (normalized.highlights !== undefined) {
    normalized.highlights = sanitizeTextBlocks(normalized.highlights);
  }

  if (normalized.contentSections !== undefined) {
    normalized.contentSections = sanitizeTextBlocks(normalized.contentSections);
  }

  if (normalized.rating !== undefined) {
    normalized.rating = Number(normalized.rating) || 0;
  }

  if (normalized.reviews !== undefined) {
    normalized.reviews = Number(normalized.reviews) || 0;
  }

  if (normalized.isProductNew !== undefined) {
    normalized.isProductNew = Boolean(normalized.isProductNew);
  }

  // Handle new complex fields
  if (Array.isArray(normalized.itinerary)) {
    normalized.itinerary = normalized.itinerary
      .filter((item) => item && item.day)
      .map((item) => ({
        day: Number(item.day),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
      }));
  }

  if (Array.isArray(normalized.applicationSteps)) {
    normalized.applicationSteps = normalized.applicationSteps
      .filter((item) => item && item.step)
      .map((item) => ({
        step: Number(item.step),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
      }));
  }

  if (Array.isArray(normalized.faq)) {
    normalized.faq = normalized.faq
      .filter((item) => item && item.question)
      .map((item) => ({
        question: String(item.question || "").trim(),
        answer: String(item.answer || "").trim(),
      }));
  }

  if (Array.isArray(normalized.inclusions)) {
    normalized.inclusions = normalized.inclusions.map(s => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(normalized.exclusions)) {
    normalized.exclusions = normalized.exclusions.map(s => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(normalized.documentsRequired)) {
    normalized.documentsRequired = normalized.documentsRequired.map(s => String(s).trim()).filter(Boolean);
  }

  if (normalized.mapAddress !== undefined) {
    normalized.mapAddress = String(normalized.mapAddress).trim();
  }

  return normalized;
};

const ensureReferencesExist = async ({ category, city, cityPoint, manualCity }) => {
  const checks = [];
  const ok = { ok: true };

  if (manualCity) {
    // If manual city is used, we still need to check category if provided
    if (category !== undefined) {
      if (!isValidObjectId(category)) {
        return { ok: false, message: "Invalid category id." };
      }
      const catExists = await Category.exists({ _id: category });
      if (!catExists) return { ok: false, message: "Category not found." };
    }
    return ok;
  }

  if (category !== undefined) {
    if (!isValidObjectId(category)) {
      return { ok: false, message: "Invalid category id." };
    }
    checks.push(Category.exists({ _id: category }));
  }

  if (city !== undefined) {
    if (!isValidObjectId(city)) {
      return { ok: false, message: "Invalid city id." };
    }
    checks.push(City.exists({ _id: city }));
  }

  if (cityPoint !== undefined) {
    if (!isValidObjectId(cityPoint)) {
      return { ok: false, message: "Invalid cityPoint id." };
    }
    checks.push(CityPoint.exists({ _id: cityPoint }));
  }

  const results = await Promise.all(checks);

  let idx = 0;
  if (category !== undefined && !results[idx++]) {
    return { ok: false, message: "Category not found." };
  }
  if (city !== undefined && !results[idx++]) {
    return { ok: false, message: "City not found." };
  }
  if (cityPoint !== undefined && !results[idx++]) {
    return { ok: false, message: "CityPoint not found." };
  }

  return { ok: true };
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      city,
      cityPoint,
      location,
      pricing,
      images,
      highlights,
      contentSections,
      rating,
      reviews,
      isProductNew,
      cruiseLine,
      departureCity,
      itinerary,
      duration,
      manualCity,
      inclusions,
      exclusions,
      applicationSteps,
      documentsRequired,
      guestPolicy,
      importantInformation,
      faq,
      bookingType,
      mapAddress,
    } = req.body;

    if (
      !name ||
      !slug ||
      !category ||
      (!city && !manualCity) ||
      (!cityPoint && !manualCity) ||
      !location ||
      !pricing
    ) {
      return res.status(400).json({
        message:
          "name, slug, category, location, and pricing are required. Also provide either a city/cityPoint or a manualCity.",
      });
    }

    const referenceCheck = await ensureReferencesExist({ category, city, cityPoint, manualCity });
    if (!referenceCheck.ok) {
      return res.status(400).json({ message: referenceCheck.message });
    }

    const payload = normalizePayload({
      name,
      slug,
      category,
      city,
      cityPoint,
      location,
      pricing,
      images,
      highlights,
      contentSections,
      rating,
      reviews,
      isProductNew,
      cruiseLine,
      departureCity,
      itinerary,
      duration,
      manualCity,
      inclusions,
      exclusions,
      applicationSteps,
      documentsRequired,
      guestPolicy,
      importantInformation,
      faq,
      bookingType,
      mapAddress,
    });

    const product = await Product.create(payload);
    const populated = await Product.findById(product._id).populate(PRODUCT_POPULATE);

    return res.status(201).json({
      message: "Product created successfully.",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to create product." });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      if (!isValidObjectId(req.query.category)) {
        return res.status(400).json({ message: "Invalid category id." });
      }
      filter.category = req.query.category;
    }

    if (req.query.city) {
      if (!isValidObjectId(req.query.city)) {
        return res.status(400).json({ message: "Invalid city id." });
      }
      filter.city = req.query.city;
    }

    if (req.query.cityPoint) {
      if (!isValidObjectId(req.query.cityPoint)) {
        return res.status(400).json({ message: "Invalid cityPoint id." });
      }
      filter.cityPoint = req.query.cityPoint;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { location: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [data, totalItems] = await Promise.all([
      Product.find(filter)
        .populate(PRODUCT_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products." });
  }
};

exports.getProductsGroupedByCity = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category id." });
    }

    const category = await Category.findById(categoryId).select("name slug");
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const products = await Product.find({ category: categoryId })
      .populate(PRODUCT_POPULATE)
      .sort({ createdAt: -1 });

    const groupedMap = new Map();
    products.forEach((product) => {
      const cityId = product.city?._id?.toString() || product.manualCity || "unknown";
      const cityName = product.city?.name || product.manualCity || "Other";

      if (!groupedMap.has(cityId)) {
        groupedMap.set(cityId, {
          cityId: product.city ? cityId : null,
          cityName,
          products: [],
        });
      }
      groupedMap.get(cityId).products.push(product);
    });

    const groupedByCity = Array.from(groupedMap.values()).sort((a, b) =>
      a.cityName.localeCompare(b.cityName)
    );

    return res.status(200).json({
      data: {
        category,
        groupedByCity,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch grouped products for category." });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }

    const product = await Product.findById(id).populate(PRODUCT_POPULATE);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ data: product });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product." });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    const product = await Product.findOne({ slug }).populate(PRODUCT_POPULATE);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ data: product });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }

    const payload = normalizePayload(req.body);
    const referenceCheck = await ensureReferencesExist({ 
      category: payload.category, 
      city: payload.city, 
      cityPoint: payload.cityPoint, 
      manualCity: payload.manualCity 
    });
    if (!referenceCheck.ok) {
      return res.status(400).json({ message: referenceCheck.message });
    }

    const updated = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate(PRODUCT_POPULATE);

    if (!updated) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      data: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product slug already exists." });
    }
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({ message: firstError || "Validation failed." });
    }
    return res.status(500).json({ message: "Failed to update product." });
  }
};

exports.getProductsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!isValidObjectId(cityId)) {
      return res.status(400).json({ message: "Invalid city id." });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const filter = { city: cityId };

    // Optional category filter
    if (req.query.category) {
      if (!isValidObjectId(req.query.category)) {
        return res.status(400).json({ message: "Invalid category id." });
      }
      filter.category = req.query.category;
    }

    // Optional search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { location: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === "rating") sort = { rating: -1 };
    if (req.query.sort === "price_low") sort = { "pricing.discountPrice": 1, "pricing.actualPrice": 1 };
    if (req.query.sort === "price_high") sort = { "pricing.discountPrice": -1, "pricing.actualPrice": -1 };
    if (req.query.sort === "name") sort = { name: 1 };

    const [data, totalItems] = await Promise.all([
      Product.find(filter)
        .populate(PRODUCT_POPULATE)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    // Also get distinct categories for filter tabs
    const categoryIds = await Product.distinct("category", { city: cityId });
    const categories = await Category.find({ _id: { $in: categoryIds } }).select("name slug");

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      data,
      categories,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products for city." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id." });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product." });
  }
};
