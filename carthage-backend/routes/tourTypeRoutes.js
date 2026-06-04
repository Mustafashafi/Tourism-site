const express = require("express");
const router = express.Router();
const tourTypeController = require("../controllers/tourTypeController");

router.post("/", tourTypeController.createTourType);
router.get("/", tourTypeController.getTourTypes);
router.get("/:id", tourTypeController.getTourTypeById);
router.patch("/:id", tourTypeController.updateTourType);
router.delete("/:id", tourTypeController.deleteTourType);

module.exports = router;
