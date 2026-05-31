const Joi = require("joi");

const tripDateSchema = Joi.object({
  tripDate: Joi.date().iso().required(),
  seatsAvailable: Joi.number().integer().min(0),
  captainId: Joi.string()
});

const packageSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  location: Joi.string().required(),
  price: Joi.number().min(0).required(),
  offerPrice: Joi.number().min(0),
  duration: Joi.string().required(),
  seats: Joi.number().integer().min(1).required(),
  status: Joi.string().valid("active", "inactive", "ACTIVE", "INACTIVE"),
  pickupPoints: Joi.array().items(Joi.string()).default([]),
  tripDates: Joi.array().items(tripDateSchema).default([])
});

const updatePackageSchema = packageSchema.fork(
  ["title", "description", "category", "location", "price", "duration", "seats"],
  (schema) => schema.optional()
).min(1);

const assignCaptainSchema = Joi.object({
  packageDateId: Joi.string().required(),
  captainId: Joi.string().required()
});

module.exports = {
  packageSchema,
  updatePackageSchema,
  assignCaptainSchema
};
