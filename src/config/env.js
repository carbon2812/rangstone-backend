require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  trustProxy: process.env.TRUST_PROXY === "true",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 30,
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  otpLength: Number(process.env.OTP_LENGTH) || 6,
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
  fast2SmsApiKey: process.env.FAST2SMS_API_KEY,
  messageId: process.env.MESSAGE_ID,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  fast2SmsWhatsappApiUrl:
    process.env.FAST2SMS_WHATSAPP_API_URL || "https://www.fast2sms.com/dev/whatsapp",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

module.exports = env;
