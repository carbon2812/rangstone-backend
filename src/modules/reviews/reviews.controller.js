const service = require("./reviews.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const create = asyncHandler(async (req, res) => success(res, "Review created successfully", await service.create(req.user.id, req.body), 201));
const list = asyncHandler(async (req, res) => success(res, "Reviews fetched successfully", await service.list()));
const updateVisibility = asyncHandler(async (req, res) => success(res, "Review visibility updated successfully", await service.updateVisibility(req.params.id, req.body.isHidden)));
const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return success(res, "Review deleted successfully");
});

module.exports = {
  create,
  list,
  updateVisibility,
  remove
};
