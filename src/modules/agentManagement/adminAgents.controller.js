const service = require("./agentManagement.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const listAgents = asyncHandler(async (req, res) =>
  success(res, "Agents fetched successfully", await service.listAgents())
);

const getAgent = asyncHandler(async (req, res) =>
  success(res, "Agent fetched successfully", await service.getAgent(req.params.id))
);

const getPermissions = asyncHandler(async (req, res) =>
  success(res, "Agent permissions fetched successfully", await service.getPermissions(req.params.id))
);

const updatePermissions = asyncHandler(async (req, res) =>
  success(res, "Agent permissions updated successfully", await service.updatePermissions(req.params.id, req.body))
);

const getCommissionRules = asyncHandler(async (req, res) =>
  success(res, "Agent commission rules fetched successfully", await service.getCommissionRules(req.params.id))
);

const updateCommissionRules = asyncHandler(async (req, res) =>
  success(res, "Agent commission rules updated successfully", await service.updateCommissionRules(req.params.id, req.body))
);

const getWallet = asyncHandler(async (req, res) =>
  success(res, "Agent wallet fetched successfully", await service.getWallet(req.params.id))
);

const getTransactions = asyncHandler(async (req, res) =>
  success(res, "Agent commission transactions fetched successfully", await service.getTransactions(req.params.id))
);

const listPayouts = asyncHandler(async (req, res) =>
  success(res, "Agent payouts fetched successfully", await service.listPayouts(req.query.status))
);

const createPayout = asyncHandler(async (req, res) =>
  success(res, "Agent payout created successfully", await service.createPayout(req.body), 201)
);

const approvePayout = asyncHandler(async (req, res) =>
  success(res, "Agent payout approved successfully", await service.approvePayout(req.params.id, req.body.remarks))
);

const payPayout = asyncHandler(async (req, res) =>
  success(res, "Agent payout marked as paid successfully", await service.payPayout(req.params.id, req.body.remarks))
);

const metrics = asyncHandler(async (req, res) =>
  success(res, "Agent admin dashboard metrics fetched successfully", await service.adminMetrics())
);

module.exports = {
  listAgents,
  getAgent,
  getPermissions,
  updatePermissions,
  getCommissionRules,
  updateCommissionRules,
  getWallet,
  getTransactions,
  listPayouts,
  createPayout,
  approvePayout,
  payPayout,
  metrics
};
