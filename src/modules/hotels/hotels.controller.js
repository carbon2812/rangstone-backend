const service = require("./hotels.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const createHotel = asyncHandler(async (req, res) => success(res, "Hotel created successfully", await service.createHotel(req.user.id, req.body, req.files || []), 201));
const listHotels = asyncHandler(async (req, res) => success(res, "Hotels fetched successfully", await service.listHotels()));
const getHotel = asyncHandler(async (req, res) => success(res, "Hotel fetched successfully", await service.getHotel(req.params.id)));
const updateHotel = asyncHandler(async (req, res) => success(res, "Hotel updated successfully", await service.updateHotel(req.params.id, req.body, req.files || [])));
const deleteHotel = asyncHandler(async (req, res) => {
  await service.deleteHotel(req.params.id);
  return success(res, "Hotel deleted successfully");
});
const addRoom = asyncHandler(async (req, res) => success(res, "Room added successfully", await service.addRoom(req.params.hotelId, req.body, req.files || []), 201));
const updateRoom = asyncHandler(async (req, res) => success(res, "Room updated successfully", await service.updateRoom(req.params.roomId, req.body, req.files || [])));
const deleteRoom = asyncHandler(async (req, res) => {
  await service.deleteRoom(req.params.roomId);
  return success(res, "Room deleted successfully");
});

module.exports = {
  createHotel,
  listHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  addRoom,
  updateRoom,
  deleteRoom
};
