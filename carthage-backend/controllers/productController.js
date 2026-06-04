const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const City = require("../models/City");
const TourType = require("../models/TourType");
const SubCategory = require("../models/SubCategory");

const PRODUCT_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "city", select: "name slug" },
  { path: "subCategory", select: "name slug" },
  { path: "tourType", select: "name slug" },
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

  if (normalized.durationInHours !== undefined) {
    normalized.durationInHours = normalized.durationInHours === "" || normalized.durationInHours === null ? null : Number(normalized.durationInHours);
  }

  if (Array.isArray(normalized.visaOptions)) {
    normalized.visaOptions = normalized.visaOptions
      .filter((v) => v && v.title)
      .map((v) => ({
        title: String(v.title || "").trim(),
        description: String(v.description || "").trim(),
        adultPrice: Number(v.adultPrice) || 0,
        childPrice: Number(v.childPrice) || 0,
        processingTime: String(v.processingTime || "").trim(),
      }));
  }

  if (normalized.tourType !== undefined) {
    if (normalized.tourType === "" || normalized.tourType === null) {
      normalized.tourType = null;
    } else if (isValidObjectId(normalized.tourType)) {
      normalized.tourType = new mongoose.Types.ObjectId(normalized.tourType);
    }
  }

  if (normalized.subCategory !== undefined) {
    if (normalized.subCategory === "" || normalized.subCategory === null) {
      normalized.subCategory = null;
    } else if (isValidObjectId(normalized.subCategory)) {
      normalized.subCategory = new mongoose.Types.ObjectId(normalized.subCategory);
    }
  }

  return normalized;
};

const ensureReferencesExist = async ({ category, city, subCategory, tourType, manualCity }) => {
  const checks = [];
  const checkKeys = [];

  if (category !== undefined && category !== null && category !== "") {
    if (!isValidObjectId(category)) {
      return { ok: false, message: "Invalid category id." };
    }
    checks.push(Category.exists({ _id: category }));
    checkKeys.push("Category");
  }

  if (city !== undefined && city !== null && city !== "" && !manualCity) {
    if (!isValidObjectId(city)) {
      return { ok: false, message: "Invalid city id." };
    }
    checks.push(City.exists({ _id: city }));
    checkKeys.push("City");
  }

  if (subCategory !== undefined && subCategory !== null && subCategory !== "") {
    if (!isValidObjectId(subCategory)) {
      return { ok: false, message: "Invalid subcategory id." };
    }
    checks.push(SubCategory.exists({ _id: subCategory }));
    checkKeys.push("SubCategory");
  }

  if (tourType !== undefined && tourType !== null && tourType !== "") {
    if (!isValidObjectId(tourType)) {
      return { ok: false, message: "Invalid tour type id." };
    }
    checks.push(TourType.exists({ _id: tourType }));
    checkKeys.push("Tour Type");
  }

  const results = await Promise.all(checks);
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) {
      return { ok: false, message: `${checkKeys[i]} not found.` };
    }
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
      subCategory,
      tourType,
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
      durationInHours,
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

    // All fields are optional — different categories need different fields

    const referenceCheck = await ensureReferencesExist({ category, city, subCategory, tourType, manualCity });
    if (!referenceCheck.ok) {
      return res.status(400).json({ message: referenceCheck.message });
    }

    const payload = normalizePayload({
      name,
      slug,
      category,
      city,
      subCategory,
      tourType,
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
      durationInHours,
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

    if (req.query.subCategory) {
      if (!isValidObjectId(req.query.subCategory)) {
        return res.status(400).json({ message: "Invalid subcategory id." });
      }
      filter.subCategory = req.query.subCategory;
    }

    if (req.query.tourType) {
      if (!isValidObjectId(req.query.tourType)) {
        return res.status(400).json({ message: "Invalid tour type id." });
      }
      filter.tourType = req.query.tourType;
    }



    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { location: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceFilter = {};
      if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;

      const priceOrConditions = [
        {
          "pricing.discountPrice": { $exists: true, $ne: null },
          "pricing.discountPrice": priceFilter
        },
        {
          $or: [
            { "pricing.discountPrice": { $exists: false } },
            { "pricing.discountPrice": null }
          ],
          "pricing.actualPrice": priceFilter
        }
      ];

      if (filter.$or) {
        const existingOr = filter.$or;
        delete filter.$or;
        filter.$and = [
          { $or: existingOr },
          { $or: priceOrConditions }
        ];
      } else {
        filter.$or = priceOrConditions;
      }
    }

    const minDuration = Number(req.query.minDuration);
    const maxDuration = Number(req.query.maxDuration);
    if (!isNaN(minDuration) || !isNaN(maxDuration)) {
      filter.durationInHours = {};
      if (!isNaN(minDuration)) filter.durationInHours.$gte = minDuration;
      if (!isNaN(maxDuration)) filter.durationInHours.$lte = maxDuration;
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
      subCategory: payload.subCategory,
      tourType: payload.tourType,
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

    // Optional subCategory filter
    if (req.query.subCategory) {
      if (!isValidObjectId(req.query.subCategory)) {
        return res.status(400).json({ message: "Invalid subcategory id." });
      }
      filter.subCategory = req.query.subCategory;
    }

    // Optional tourType filter
    if (req.query.tourType) {
      if (!isValidObjectId(req.query.tourType)) {
        return res.status(400).json({ message: "Invalid tour type id." });
      }
      filter.tourType = req.query.tourType;
    }

    // Optional search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { location: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceFilter = {};
      if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;

      const priceOrConditions = [
        {
          "pricing.discountPrice": { $exists: true, $ne: null },
          "pricing.discountPrice": priceFilter
        },
        {
          $or: [
            { "pricing.discountPrice": { $exists: false } },
            { "pricing.discountPrice": null }
          ],
          "pricing.actualPrice": priceFilter
        }
      ];

      if (filter.$or) {
        const existingOr = filter.$or;
        delete filter.$or;
        filter.$and = [
          { $or: existingOr },
          { $or: priceOrConditions }
        ];
      } else {
        filter.$or = priceOrConditions;
      }
    }

    const minDuration = Number(req.query.minDuration);
    const maxDuration = Number(req.query.maxDuration);
    if (!isNaN(minDuration) || !isNaN(maxDuration)) {
      filter.durationInHours = {};
      if (!isNaN(minDuration)) filter.durationInHours.$gte = minDuration;
      if (!isNaN(maxDuration)) filter.durationInHours.$lte = maxDuration;
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

exports.getNavigationHierarchy = async (req, res) => {
  try {
    const products = await Product.find({
      city: { $ne: null },
      category: { $ne: null },
      subCategory: { $ne: null },
      tourType: { $ne: null }
    }).populate(PRODUCT_POPULATE);

    const hierarchy = [];
    const cityMap = new Map();

    for (const product of products) {
      if (!product.city || !product.category || !product.subCategory || !product.tourType) continue;

      const cityId = product.city._id.toString();
      const catId = product.category._id.toString();
      const subCatId = product.subCategory._id.toString();
      const tourTypeId = product.tourType._id.toString();

      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, {
          id: cityId,
          name: product.city.name,
          slug: product.city.slug,
          categoriesMap: new Map()
        });
      }

      const cityNode = cityMap.get(cityId);

      if (!cityNode.categoriesMap.has(catId)) {
        cityNode.categoriesMap.set(catId, {
          id: catId,
          name: product.category.name,
          slug: product.category.slug,
          subCategoriesMap: new Map()
        });
      }

      const catNode = cityNode.categoriesMap.get(catId);

      if (!catNode.subCategoriesMap.has(subCatId)) {
        catNode.subCategoriesMap.set(subCatId, {
          id: subCatId,
          name: product.subCategory.name,
          slug: product.subCategory.slug,
          tourTypesMap: new Map()
        });
      }

      const subCatNode = catNode.subCategoriesMap.get(subCatId);

      if (!subCatNode.tourTypesMap.has(tourTypeId)) {
        subCatNode.tourTypesMap.set(tourTypeId, {
          id: tourTypeId,
          name: product.tourType.name,
          slug: product.tourType.slug
        });
      }
    }

    for (const [_, cityNode] of cityMap) {
      const categories = [];
      for (const [_, catNode] of cityNode.categoriesMap) {
        const subCategories = [];
        for (const [_, subCatNode] of catNode.subCategoriesMap) {
          subCategories.push({
            id: subCatNode.id,
            name: subCatNode.name,
            slug: subCatNode.slug,
            tourTypes: Array.from(subCatNode.tourTypesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
          });
        }
        categories.push({
          id: catNode.id,
          name: catNode.name,
          slug: catNode.slug,
          subCategories: subCategories.sort((a, b) => a.name.localeCompare(b.name))
        });
      }
      hierarchy.push({
        id: cityNode.id,
        name: cityNode.name,
        slug: cityNode.slug,
        categories: categories.sort((a, b) => a.name.localeCompare(b.name))
      });
    }

    hierarchy.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ data: hierarchy });
  } catch (error) {
    console.error("Failed to fetch navigation hierarchy:", error);
    return res.status(500).json({ message: "Failed to fetch navigation hierarchy." });
  }
};
