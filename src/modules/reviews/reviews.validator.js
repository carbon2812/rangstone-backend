const Joi = require("joi");

const reviewSchema = Joi.object({
  targetType: Joi.string().valid("PACKAGE", "HOTEL", "VEHICLE").required(),
  targetId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow("")
});

const visibilitySchema = Joi.object({
  isHidden: Joi.boolean().required()
});

module.exports = {
  reviewSchema,
  visibilitySchema
};
