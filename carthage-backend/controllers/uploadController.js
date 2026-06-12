const { v2: cloudinary } = require("cloudinary");

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

exports.uploadImage = async (req, res) => {
  try {
    configureCloudinary();

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to your .env file.",
      });
    }

    const incomingFiles = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      incomingFiles.push(...req.files);
    }
    if (req.file) {
      incomingFiles.push(req.file);
    }

    if (incomingFiles.length === 0) {
      // No files uploaded – return empty array to keep client code consistent
      return res.status(200).json({ message: "No image files provided.", data: [] });
    }

    const uploadPromises = incomingFiles.map((file) => {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return cloudinary.uploader.upload(dataUri, {
        folder: "carthage-tours/products",
        resource_type: "auto",
      });
    });

    const results = await Promise.all(uploadPromises);
    const uploaded = results.map((result) => ({ url: result.secure_url, publicId: result.public_id }));

    const responseData = uploaded.length === 1 ? uploaded[0] : uploaded;

    return res.status(201).json({
      message: "Images uploaded successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Failed to upload image.",
      error: error.message || String(error),
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    configureCloudinary();

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to your .env file.",
      });
    }

    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "publicId is required." });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(400).json({ message: "Failed to delete image." });
    }

    return res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      message: "Failed to delete image.",
      error: error.message || String(error),
    });
  }
};
