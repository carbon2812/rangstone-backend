const service = require("./dashboard.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const overview = asyncHandler(async (req, res) => success(res, "Dashboard overview fetched successfully", await service.overview()));
const revenueGraph = asyncHandler(async (req, res) => success(res, "Revenue graph fetched successfully", await service.revenueGraph()));

module.exports = {
  overview,
  revenueGraph
};
