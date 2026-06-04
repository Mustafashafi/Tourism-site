const express = require("express");
const {
  createReview,
  getReviews,
  getReviewsByCity,
} = require("../controllers/reviewController");

const router = express.Router();

// @route   POST /api/reviews/product/:productId
// @desc    Create a new review for a product
router.post("/product/:productId", createReview);

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
router.get("/product/:productId", getReviews);

// @route   GET /api/reviews/city/:cityId
// @desc    Get aggregated reviews for all products in a city
router.get("/city/:cityId", getReviewsByCity);

module.exports = router;
