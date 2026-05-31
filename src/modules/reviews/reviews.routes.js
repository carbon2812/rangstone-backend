const express = require("express");
const controller = require("./reviews.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { reviewSchema, visibilitySchema } = require("./reviews.validator");

const router = express.Router();

router.get("/", controller.list);
router.post("/", authenticate, authorize("CUSTOMER"), validate(reviewSchema), controller.create);
router.patch("/:id/visibility", authenticate, authorize("SUPER_ADMIN", "ADMIN"), validate(visibilitySchema), controller.updateVisibility);
router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), controller.remove);

module.exports = router;
