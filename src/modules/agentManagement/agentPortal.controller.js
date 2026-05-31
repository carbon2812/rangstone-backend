const service = require("./agentManagement.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const dashboard = asyncHandler(async (req, res) =>
  success(res, "Agent dashboard fetched successfully", await service.agentDashboard(req.user.id))
);

const wallet = asyncHandler(async (req, res) =>
  success(res, "Agent wallet fetched successfully", await service.agentWallet(req.user.id))
);

const commissionHistory = asyncHandler(async (req, res) =>
  success(res, "Agent commission history fetched successfully", await service.agentCommissionHistory(req.user.id))
);

const payoutHistory = asyncHandler(async (req, res) =>
  success(res, "Agent payout history fetched successfully", await service.agentPayoutHistory(req.user.id))
);

module.exports = {
  dashboard,
  wallet,
  commissionHistory,
  payoutHistory
};
