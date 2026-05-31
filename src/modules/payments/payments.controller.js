const service = require("./payments.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const createOrder = asyncHandler(async (req, res) => success(res, "Razorpay order created successfully", await service.createOrder(req.body), 201));
const verifyPayment = asyncHandler(async (req, res) => success(res, "Payment verified successfully", await service.verifyPayment(req.body)));
const transactions = asyncHandler(async (req, res) => success(res, "Transactions fetched successfully", await service.transactions()));
const createRefund = asyncHandler(async (req, res) => success(res, "Refund created successfully", await service.createRefund(req.body), 201));

module.exports = {
  createOrder,
  verifyPayment,
  transactions,
  createRefund
};
