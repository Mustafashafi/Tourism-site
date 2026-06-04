const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      reviews: stats[0].nRating,
      rating: parseFloat(stats[0].avgRating.toFixed(2)),
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      reviews: 0,
      rating: 0,
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, userEmail, rating, comment, isGuest, userImage } = req.body;

    const review = await Review.create({
      product: productId,
      user: req.user ? req.user.id : undefined,
      userName,
      userEmail,
      rating,
      comment,
      isGuest,
      userImage,
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReviewsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    // Find all product IDs belonging to this city
    const productIds = await Product.find({ city: cityId }).distinct("_id");

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        stats: { avgRating: 0, totalReviews: 0 },
      });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

    const reviews = await Review.find({ product: { $in: productIds } })
      .sort("-createdAt")
      .limit(limit)
      .populate({ path: "product", select: "name slug images" });

    // Compute aggregate stats
    const stats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length > 0 ? parseFloat(stats[0].avgRating.toFixed(2)) : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      stats: { avgRating, totalReviews },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
