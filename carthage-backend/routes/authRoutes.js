const express = require("express");
const { register, login, sendMagicLink, verifyMagicLink, googleLogin, getUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/magiclink/send", sendMagicLink);
router.get("/magiclink/verify", verifyMagicLink);
router.post("/google", googleLogin);
router.get("/users", getUsers);

module.exports = router;
