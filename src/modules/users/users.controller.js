const service = require("./users.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const list = asyncHandler(async (req, res) => success(res, "Users fetched successfully", await service.list()));
const get = asyncHandler(async (req, res) => success(res, "User fetched successfully", await service.get(req.params.id)));
const create = asyncHandler(async (req, res) => success(res, "User created successfully", await service.create(req.body), 201));
const update = asyncHandler(async (req, res) => success(res, "User updated successfully", await service.update(req.params.id, req.body)));
const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return success(res, "User deleted successfully");
});
const block = asyncHandler(async (req, res) => success(res, "User block status updated successfully", await service.block(req.params.id, req.body.isBlocked)));
const activityLogs = asyncHandler(async (req, res) => success(res, "Activity logs fetched successfully", await service.activityLogs(req.query.userId)));

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  block,
  activityLogs
};
