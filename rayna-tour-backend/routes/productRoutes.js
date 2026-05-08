const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsGroupedByCity,
  getProductsByCity,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/grouped/category/:categoryId", getProductsGroupedByCity);
router.get("/city/:cityId", getProductsByCity);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
