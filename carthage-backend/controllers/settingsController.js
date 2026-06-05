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

    if (req.body.faq !== undefined) {
      settings.faq = Array.isArray(req.body.faq)
        ? req.body.faq.map((item) => ({
            question: String(item.question || "").trim(),
            answer: String(item.answer || "").trim(),
          }))
        : [];
    }

    if (req.body.contactDetails) {
      settings.contactDetails = {
        phone: req.body.contactDetails.phone || "",
        email: req.body.contactDetails.email || "",
        address: req.body.contactDetails.address || "",
        description: req.body.contactDetails.description || "",
      };
    }

    if (req.body.stripe) {
      settings.stripe = {
        publicKey: req.body.stripe.publicKey || "",
        secretKey: req.body.stripe.secretKey || "",
        enabled: req.body.stripe.enabled ?? false,
      };
    }
    if (req.body.paypal) {
      settings.paypal = {
        clientId: req.body.paypal.clientId || "",
        clientSecret: req.body.paypal.clientSecret || "",
        enabled: req.body.paypal.enabled ?? false,
      };
    }
    if (req.body.etihadPay) {
      settings.etihadPay = {
        merchantId: req.body.etihadPay.merchantId || "",
        apiKey: req.body.etihadPay.apiKey || "",
        enabled: req.body.etihadPay.enabled ?? false,
      };
    }

    if (req.body.smtp) {
      settings.smtp = {
        host: req.body.smtp.host || "",
        port: req.body.smtp.port || 587,
        user: req.body.smtp.user || "",
        pass: req.body.smtp.pass || "",
        secure: req.body.smtp.secure ?? false,
        fromEmail: req.body.smtp.fromEmail || "",
        fromName: req.body.smtp.fromName || "",
      };
    }

    if (req.body.logos) {
      settings.logos = {
        headerLogoLight: req.body.logos.headerLogoLight || "",
        headerLogoDark: req.body.logos.headerLogoDark || "",
        footerLogo: req.body.logos.footerLogo || "",
        favicon: req.body.logos.favicon || "",
      };
    }

    if (req.body.emailTemplates) {
      settings.emailTemplates = {
        newBookingAdmin: {
          subject: req.body.emailTemplates.newBookingAdmin?.subject || "",
          body: req.body.emailTemplates.newBookingAdmin?.body || "",
        },
        newBookingCustomer: {
          subject: req.body.emailTemplates.newBookingCustomer?.subject || "",
          body: req.body.emailTemplates.newBookingCustomer?.body || "",
        },
        bookingCompleted: {
          subject: req.body.emailTemplates.bookingCompleted?.subject || "",
          body: req.body.emailTemplates.bookingCompleted?.body || "",
        },
      };
    }

    if (req.body.siteContent) {
      settings.siteContent = {
        aboutUs: {
          title: req.body.siteContent.aboutUs?.title || "",
          content: req.body.siteContent.aboutUs?.content || "",
          mission: req.body.siteContent.aboutUs?.mission || "",
          vision: req.body.siteContent.aboutUs?.vision || "",
          heroImageUrl: req.body.siteContent.aboutUs?.heroImageUrl || "",
          sectionImageUrl: req.body.siteContent.aboutUs?.sectionImageUrl || "",
        },
      };
    }

    if (req.body.homepageCuration) {
      settings.homepageCuration = {
        activities: req.body.homepageCuration.activities || [],
        cruises: req.body.homepageCuration.cruises || [],
        holidays: req.body.homepageCuration.holidays || [],
      };
    }

    await settings.save();
    return res.status(200).json({ message: "Settings updated successfully.", data: settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Failed to update settings." });
  }
};
