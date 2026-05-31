const express = require("express");
const controller = require("./packages.controller");
const validate = require("../../middlewares/validateMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { packageSchema, updatePackageSchema, assignCaptainSchema } = require("./packages.validator");

const router = express.Router();
const canManagePackages = authorize("SUPER_ADMIN", "ADMIN", "TRAVEL_VENDOR");

router.get("/", controller.list);
router.get("/:id", controller.get);
router.post("/", authenticate, canManagePackages, upload.array("images", 10), validate(packageSchema), controller.create);
router.patch("/:id", authenticate, canManagePackages, upload.array("images", 10), validate(updatePackageSchema), controller.update);
router.delete("/:id", authenticate, canManagePackages, controller.remove);
router.post("/assign-captain", authenticate, authorize("SUPER_ADMIN", "ADMIN"), validate(assignCaptainSchema), controller.assignCaptain);

module.exports = router;
