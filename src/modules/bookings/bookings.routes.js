const express = require("express");
const controller = require("./bookings.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const {
  packageBookingSchema,
  hotelBookingSchema,
  vehicleBookingSchema,
  statusSchema
} = require("./bookings.validator");

const router = express.Router();

router.use(authenticate);
router.get("/history", controller.history);
router.post("/packages", authorize("CUSTOMER", "AGENT_VENDOR", "SUPER_ADMIN", "ADMIN"), validate(packageBookingSchema), controller.createPackageBooking);
router.post("/hotels", authorize("CUSTOMER", "AGENT_VENDOR", "SUPER_ADMIN", "ADMIN"), validate(hotelBookingSchema), controller.createHotelBooking);
router.post("/vehicles", authorize("CUSTOMER", "AGENT_VENDOR", "SUPER_ADMIN", "ADMIN"), validate(vehicleBookingSchema), controller.createVehicleBooking);
router.patch("/packages/:id/status", authorize("SUPER_ADMIN", "ADMIN"), validate(statusSchema), controller.updatePackageBookingStatus);
router.post("/packages/:id/cancel", controller.cancelPackageBooking);

module.exports = router;
