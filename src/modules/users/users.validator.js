const Joi = require("joi");

const role = Joi.string().valid(
  "SUPER_ADMIN",
  "ADMIN",
  "CUSTOMER",
  "CAPTAIN",
  "AGENT_VENDOR",
  "HOTEL_VENDOR",
  "TRAVEL_VENDOR",
  "VEHICLE_VENDOR"
);

const createUserSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\d{10,15}$/).required(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  firstName: Joi.string().min(2).max(80),
  lastName: Joi.string().allow(""),
  role: role.required()
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  firstName: Joi.string().min(2).max(80),
  lastName: Joi.string().allow(""),
  role,
  isActive: Joi.boolean(),
  isBlocked: Joi.boolean()
}).min(1);

const blockUserSchema = Joi.object({
  isBlocked: Joi.boolean().required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  blockUserSchema
};
