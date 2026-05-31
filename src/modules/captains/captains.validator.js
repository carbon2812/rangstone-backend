const Joi = require("joi");

const profileSchema = Joi.object({
  userId: Joi.string().required(),
  licenseNumber: Joi.string(),
  experienceYears: Joi.number().integer().min(0)
});

const verifyTicketSchema = Joi.object({
  bookingCode: Joi.string().required(),
  status: Joi.string().valid("VERIFIED", "BOARDED", "NOT_BOARDED").required()
});

module.exports = {
  profileSchema,
  verifyTicketSchema
};
