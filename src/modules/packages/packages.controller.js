const service = require("./packages.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const create = asyncHandler(async (req, res) => success(res, "Package created successfully", await service.create(req.body, req.files || []), 201));
const list = asyncHandler(async (req, res) => success(res, "Packages fetched successfully", await service.list()));
const get = asyncHandler(async (req, res) => success(res, "Package fetched successfully", await service.get(req.params.id)));
const update = asyncHandler(async (req, res) => success(res, "Package updated successfully", await service.update(req.params.id, req.body, req.files || [])));
const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return success(res, "Package deleted successfully");
});
const assignCaptain = asyncHandler(async (req, res) => success(res, "Captain assigned successfully", await service.assignCaptain(req.body.packageDateId, req.body.captainId)));

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  assignCaptain
};
