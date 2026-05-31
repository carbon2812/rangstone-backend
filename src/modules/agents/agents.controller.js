const service = require("./agents.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const upsertProfile = asyncHandler(async (req, res) => success(res, "Agent profile saved successfully", await service.upsertProfile(req.body), 201));
const myProfile = asyncHandler(async (req, res) => success(res, "Agent profile fetched successfully", await service.getProfile(req.user.id)));
const commissions = asyncHandler(async (req, res) => success(res, "Commission history fetched successfully", await service.commissions(req.user.id)));
const calculateMonthlyPayout = asyncHandler(async (req, res) => success(res, "Monthly payout calculated successfully", await service.calculateMonthlyPayout(req.user.id, req.body.period), 201));
const updatePayoutStatus = asyncHandler(async (req, res) => success(res, "Payout status updated successfully", await service.updatePayoutStatus(req.params.id, req.body.status)));

module.exports = {
  upsertProfile,
  myProfile,
  commissions,
  calculateMonthlyPayout,
  updatePayoutStatus
};
