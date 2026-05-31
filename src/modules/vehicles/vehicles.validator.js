const Joi = require("joi");

const vehicleSchema = Joi.object({
  vendorId: Joi.string(),
  type: Joi.string().valid("CAR", "BIKE", "SCOOTER").required(),
  brand: Joi.string().required(),
  model: Joi.string().required(),
  registrationNumber: Joi.string().required(),
  fuelType: Joi.string().required(),
  seatingCapacity: Joi.number().integer().min(1).required(),
  pricePerHour: Joi.number().min(0).required(),
  pricePerDay: Joi.number().min(0).required(),
  securityDeposit: Joi.number().min(0).required(),
  pickupLocation: Joi.string().required(),
  dropLocation: Joi.string().required(),
  withDriver: Joi.boolean(),
  selfDrive: Joi.boolean(),
  availability: Joi.string().valid("AVAILABLE", "BOOKED", "MAINTENANCE")
});

const updateVehicleSchema = vehicleSchema.fork(
  [
    "type",
    "brand",
    "model",
    "registrationNumber",
    "fuelType",
    "seatingCapacity",
    "pricePerHour",
    "pricePerDay",
    "securityDeposit",
    "pickupLocation",
    "dropLocation"
  ],
  (schema) => schema.optional()
).min(1);

module.exports = {
  vehicleSchema,
  updateVehicleSchema
};
