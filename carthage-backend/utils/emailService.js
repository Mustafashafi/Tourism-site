const nodemailer = require("nodemailer");
const Settings = require("../models/Settings");

/**
 * Dynamically constructs a Nodemailer transporter using active SMTP settings from DB.
 */
const getTransporter = async () => {
  const settings = await Settings.findOne();
  if (!settings || !settings.smtp || !settings.smtp.host) {
    console.warn("SMTP settings are not configured in settings document.");
    return null;
  }

  const { host, port, user, pass, secure } = settings.smtp;
  return nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Boolean(secure),
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Replace simple template tokens.
 */
const renderTemplate = (text, tokens) => {
  let rendered = String(text || "");
  Object.entries(tokens).forEach(([key, val]) => {
    rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
  });
  return rendered;
};

/**
 * Sends a custom email notification.
 */
const sendNotification = async (type, recipientEmail, tokens) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return;

    const transporter = await getTransporter();
    if (!transporter) return;

    let template = settings.emailTemplates?.[type];
    if (!template) {
      console.warn(`Email template type "${type}" is not defined.`);
      return;
    }

    const fromEmail = settings.smtp.fromEmail || settings.smtp.user;
    const fromName = settings.smtp.fromName || "Carthage Travel";

    const subject = renderTemplate(template.subject, tokens);
    const body = renderTemplate(template.body, tokens);

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject,
      text: body, // plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${recipientEmail}: ${info.messageId}`);
  } catch (error) {
    console.error("Failed to send email notification:", error.message);
  }
};

module.exports = {
  sendNotification,
};
