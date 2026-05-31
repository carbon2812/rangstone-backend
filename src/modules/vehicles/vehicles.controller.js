const service = require("./vehicles.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const create = asyncHandler(async (req, res) => success(res, "Vehicle created successfully", await service.create(req.user.id, req.body, req.files || []), 201));
const list = asyncHandler(async (req, res) => success(res, "Vehicles fetched successfully", await service.list()));
const get = asyncHandler(async (req, res) => success(res, "Vehicle fetched successfully", await service.get(req.params.id)));
const update = asyncHandler(async (req, res) => success(res, "Vehicle updated successfully", await service.update(req.params.id, req.body, req.files || [])));
const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return success(res, "Vehicle deleted successfully");
});

module.exports = {
  create,
  list,
  get,
  update,
  remove
};
