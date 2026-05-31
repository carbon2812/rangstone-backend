const Joi = require("joi");

const orderSchema = Joi.object({
  bookingType: Joi.string().valid("PACKAGE", "HOTEL", "VEHICLE").required(),
  bookingId: Joi.string().required()
});

const verifySchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required()
});

const refundSchema = Joi.object({
  paymentId: Joi.string().required(),
  amount: Joi.number().min(0).required()
});

module.exports = {
  orderSchema,
  verifySchema,
  refundSchema
};
