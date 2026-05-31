const express = require("express");
const controller = require("./auth.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate } = require("../../middlewares/authMiddleware");
const {
  sendOtpLimiter,
  verifyOtpLimiter
} = require("../../middlewares/rateLimitMiddleware");
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  refreshSchema,
  checkUserSchema
} = require("./auth.validator");

const router = express.Router();

router.post("/send-otp", sendOtpLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post("/verify-otp", verifyOtpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh-token", validate(refreshSchema), controller.refresh);
router.post("/logout", validate(refreshSchema), controller.logout);
router.get("/me", authenticate, controller.profile);
router.post("/check-user", validate(checkUserSchema), controller.checkUser);

module.exports = router;
