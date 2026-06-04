const express = require("express");
const {
  createCity,
  getCities,
  getCityById,
  getCityBySlug,
  updateCity,
  deleteCity,
} = require("../controllers/cityController");

const router = express.Router();

router.get("/", getCities);
router.get("/slug/:slug", getCityBySlug);
router.get("/:id", getCityById);
router.post("/", createCity);
router.patch("/:id", updateCity);
router.delete("/:id", deleteCity);

module.exports = router;

