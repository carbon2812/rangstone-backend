const Joi = require("joi");

const profileSchema = Joi.object({
  userId: Joi.string().required(),
  commissionRate: Joi.number().min(0).max(1).default(0.1),
  payoutDetails: Joi.object()
});

const payoutSchema = Joi.object({
  period: Joi.string().required()
});

const payoutStatusSchema = Joi.object({
  status: Joi.string().valid("PENDING", "PROCESSING", "PAID").required()
});

module.exports = {
  profileSchema,
  payoutSchema,
  payoutStatusSchema
};
