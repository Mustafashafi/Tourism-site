const express = require("express");
const { uploadImage, deleteImage } = require("../controllers/uploadController");
const multipartParser = require("../middleware/multipartParser");

const router = express.Router();

// Parse multipart/form-data for image uploads (up to 5 MB)
router.use(multipartParser);

router.post("/image", uploadImage);
router.delete("/image", deleteImage);

module.exports = router;
