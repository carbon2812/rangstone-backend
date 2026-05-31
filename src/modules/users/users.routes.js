const express = require("express");
const controller = require("./users.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { createUserSchema, updateUserSchema, blockUserSchema } = require("./users.validator");

const router = express.Router();
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

router.use(authenticate, adminOnly);
router.get("/", controller.list);
router.post("/", validate(createUserSchema), controller.create);
router.get("/activity-logs", controller.activityLogs);
router.get("/:id", controller.get);
router.patch("/:id", validate(updateUserSchema), controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/block", validate(blockUserSchema), controller.block);

module.exports = router;
