const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.status(200).json({ data: settings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch settings." });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (req.body.socialLinks) {
      settings.socialLinks = {
        facebook: req.body.socialLinks.facebook || "",
        instagram: req.body.socialLinks.instagram || "",
        twitter: req.body.socialLinks.twitter || "",
        youtube: req.body.socialLinks.youtube || "",
        linkedin: req.body.socialLinks.linkedin || "",
        whatsapp: req.body.socialLinks.whatsapp || "",
      };
    }

    if (req.body.privacyPolicy !== undefined) {
      settings.privacyPolicy = req.body.privacyPolicy;
    }
    if (req.body.termsAndConditions !== undefined) {
      settings.termsAndConditions = req.body.termsAndConditions;
    }
    if (req.body.refundPolicy !== undefined) {
      settings.refundPolicy = req.body.refundPolicy;
    }

    if (req.body.contactDetails) {
      settings.contactDetails = {
        phone: req.body.contactDetails.phone || "",
        email: req.body.contactDetails.email || "",
        address: req.body.contactDetails.address || "",
        description: req.body.contactDetails.description || "",
      };
    }

    await settings.save();
    return res.status(200).json({ message: "Settings updated successfully.", data: settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Failed to update settings." });
  }
};
