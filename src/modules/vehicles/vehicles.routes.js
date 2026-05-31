const express = require("express");
const controller = require("./vehicles.controller");
const validate = require("../../middlewares/validateMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { vehicleSchema, updateVehicleSchema } = require("./vehicles.validator");

const router = express.Router();
const canManageVehicles = authorize("SUPER_ADMIN", "ADMIN", "VEHICLE_VENDOR");

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", authenticate, canManageVehicles, upload.array("images", 10), validate(vehicleSchema), controller.create);
router.patch("/:id", authenticate, canManageVehicles, upload.array("images", 10), validate(updateVehicleSchema), controller.update);
router.delete("/:id", authenticate, canManageVehicles, controller.remove);

module.exports = router;
