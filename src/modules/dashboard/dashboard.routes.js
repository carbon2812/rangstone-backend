const express = require("express");
const controller = require("./dashboard.controller");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));
router.get("/overview", controller.overview);
router.get("/revenue-graph", controller.revenueGraph);

module.exports = router;
