const rateLimit = require("express-rate-limit");

const minutesToMs = (minutes) => minutes * 60 * 1000;

const buildRateLimitMessage = (message) => ({
  success: false,
  message
});

const apiLimiter = rateLimit({
  windowMs: minutesToMs(Number(process.env.API_RATE_LIMIT_WINDOW_MINUTES) || 15),
  max: Number(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage("Too many requests. Please try again later.")
});

const sendOtpLimiter = rateLimit({
  windowMs: minutesToMs(Number(process.env.OTP_SEND_RATE_LIMIT_WINDOW_MINUTES) || 15),
  max: Number(process.env.OTP_SEND_RATE_LIMIT_MAX_REQUESTS) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage("Too many OTP requests. Please try again later.")
});

const verifyOtpLimiter = rateLimit({
  windowMs: minutesToMs(Number(process.env.OTP_VERIFY_RATE_LIMIT_WINDOW_MINUTES) || 15),
  max: Number(process.env.OTP_VERIFY_RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage("Too many OTP verification attempts. Please try again later.")
});

module.exports = {
  apiLimiter,
  sendOtpLimiter,
  verifyOtpLimiter
};
