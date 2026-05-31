const Joi = require("joi");

const packageBookingSchema = Joi.object({
  packageDateId: Joi.string().required(),
  seatsBooked: Joi.number().integer().min(1).required(),
  referralCode: Joi.string()
});

const hotelBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref("checkInDate")).required()
});

const vehicleBookingSchema = Joi.object({
  vehicleId: Joi.string().required(),
  pickupLocation: Joi.string().required(),
  dropLocation: Joi.string().required(),
  startDateTime: Joi.date().iso().required(),
  endDateTime: Joi.date().iso().greater(Joi.ref("startDateTime")).required(),
  rentalType: Joi.string().valid("HOURLY", "DAILY").required(),
  cancellationPolicy: Joi.string()
});

const statusSchema = Joi.object({
  bookingStatus: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED").required()
});

module.exports = {
  packageBookingSchema,
  hotelBookingSchema,
  vehicleBookingSchema,
  statusSchema
};
