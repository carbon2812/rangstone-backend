const express = require("express");
const {
  sendOtp,
  verifyOtp,
  getWalletBalance
} = require("../controllers/authController");
const {
  sendOtpLimiter,
  verifyOtpLimiter
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/send-otp", sendOtpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.get("/wallet", getWalletBalance);

module.exports = router;
