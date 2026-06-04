const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/User");
const { sendMagicLinkEmail } = require("../utils/emailService");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = "860874102599-d8jog91f7t0cfb5olp881l2hq6bio6jc.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const signToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    user.password = undefined;

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
};

exports.sendMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0]
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const magicToken = jwt.sign({ email: normalizedEmail, userId: user._id }, jwtSecret, { expiresIn: '15m' });

    await sendMagicLinkEmail(normalizedEmail, magicToken);

    return res.status(200).json({ message: "Magic link sent successfully." });
  } catch (error) {
    console.error("Magic link error:", error);
    return res.status(500).json({ message: error.message || "Failed to send magic link." });
  }
};

exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired link." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const sessionToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      message: "Login verified successfully",
      token: sessionToken,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error("Magic link verification error:", error);
    return res.status(500).json({ message: "Invalid or expired magic link." });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token, isAccessToken } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required." });
    }

    let email, name, picture, sub;

    if (isAccessToken) {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      ({ email, name, picture, sub } = response.data);
    } else {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      ({ email, name, picture, sub } = payload);
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: name,
        googleId: sub,
        profilePicture: picture,
      });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = sub;
        updated = true;
      }
      if (picture && user.profilePicture !== picture) {
        user.profilePicture = picture;
        updated = true;
      }
      if (updated) await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET;
    const sessionToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "7d" });

    res.status(200).json({
      message: "Google login successful",
      token: sessionToken,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google authentication failed." });
  }
};
