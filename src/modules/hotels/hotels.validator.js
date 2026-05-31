const Joi = require("joi");

const hotelSchema = Joi.object({
  ownerId: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  rating: Joi.number().min(0).max(5),
  status: Joi.string().valid("ACTIVE", "INACTIVE")
});

const updateHotelSchema = hotelSchema.fork(["name", "description", "location"], (schema) =>
  schema.optional()
).min(1);

const roomSchema = Joi.object({
  roomType: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  amenities: Joi.array().items(Joi.string()).default([]),
  availability: Joi.boolean(),
  status: Joi.string().valid("AVAILABLE", "BOOKED", "MAINTENANCE")
});

const updateRoomSchema = roomSchema.fork(["roomType", "description", "price"], (schema) =>
  schema.optional()
).min(1);

module.exports = {
  hotelSchema,
  updateHotelSchema,
  roomSchema,
  updateRoomSchema
};
