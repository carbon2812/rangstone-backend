const express = require("express");
const controller = require("./hotels.controller");
const validate = require("../../middlewares/validateMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { hotelSchema, updateHotelSchema, roomSchema, updateRoomSchema } = require("./hotels.validator");

const router = express.Router();
const canManageHotels = authorize("SUPER_ADMIN", "ADMIN", "HOTEL_VENDOR");

router.get("/", controller.listHotels);
router.get("/:id", controller.getHotel);
router.post("/", authenticate, canManageHotels, upload.array("images", 10), validate(hotelSchema), controller.createHotel);
router.patch("/:id", authenticate, canManageHotels, upload.array("images", 10), validate(updateHotelSchema), controller.updateHotel);
router.delete("/:id", authenticate, canManageHotels, controller.deleteHotel);
router.post("/:hotelId/rooms", authenticate, canManageHotels, upload.array("images", 10), validate(roomSchema), controller.addRoom);
router.patch("/rooms/:roomId", authenticate, canManageHotels, upload.array("images", 10), validate(updateRoomSchema), controller.updateRoom);
router.delete("/rooms/:roomId", authenticate, canManageHotels, controller.deleteRoom);

module.exports = router;
