const service = require("./captains.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const createProfile = asyncHandler(async (req, res) => success(res, "Captain profile saved successfully", await service.createProfile(req.body), 201));
const assignedTrips = asyncHandler(async (req, res) => success(res, "Assigned trips fetched successfully", await service.assignedTrips(req.user.id)));
const verifyTicket = asyncHandler(async (req, res) => success(res, "Ticket verification updated successfully", await service.verifyTicket(req.user.id, req.body)));

module.exports = {
  createProfile,
  assignedTrips,
  verifyTicket
};
