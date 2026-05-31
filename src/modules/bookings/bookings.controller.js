const service = require("./bookings.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const createPackageBooking = asyncHandler(async (req, res) => success(res, "Package booking created successfully", await service.createPackageBooking(req.user.id, req.body), 201));
const createHotelBooking = asyncHandler(async (req, res) => success(res, "Hotel booking created successfully", await service.createHotelBooking(req.user.id, req.body), 201));
const createVehicleBooking = asyncHandler(async (req, res) => success(res, "Vehicle booking created successfully", await service.createVehicleBooking(req.user.id, req.body), 201));
const history = asyncHandler(async (req, res) => success(res, "Booking history fetched successfully", await service.history(req.user.id)));
const updatePackageBookingStatus = asyncHandler(async (req, res) => success(res, "Booking status updated successfully", await service.updatePackageBookingStatus(req.params.id, req.body.bookingStatus)));
const cancelPackageBooking = asyncHandler(async (req, res) => success(res, "Booking cancelled successfully", await service.cancelPackageBooking(req.params.id)));

module.exports = {
  createPackageBooking,
  createHotelBooking,
  createVehicleBooking,
  history,
  updatePackageBookingStatus,
  cancelPackageBooking
};
