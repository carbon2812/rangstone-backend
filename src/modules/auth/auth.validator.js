const Joi = require("joi");

const phone = Joi.string().pattern(/^\d{10,15}$/).required();

const sendOtpSchema = Joi.object({
  phone
});

const verifyOtpSchema = Joi.object({
  phone,
  otp: Joi.string().pattern(/^\d{4,8}$/).required()
});

const registerSchema = Joi.object({
  phoneNumber: phone,
  email: Joi.string().email(),
  password: Joi.string().min(6),
  firstName: Joi.string().min(2).max(80).required(),
  lastName: Joi.string().min(1).max(80).allow(""),
  role: Joi.string().valid(
    "CUSTOMER",
    "CAPTAIN",
    "AGENT_VENDOR",
    "HOTEL_VENDOR",
    "TRAVEL_VENDOR",
    "VEHICLE_VENDOR"
  )
});

const loginSchema = Joi.object({
  phoneNumber: phone,
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const checkUserSchema = Joi.object({
  phone
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  refreshSchema,
  checkUserSchema
};
