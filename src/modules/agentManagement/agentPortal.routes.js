const express = require("express");
const controller = require("./agentPortal.controller");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate, authorize("AGENT_VENDOR"));
router.get("/dashboard", controller.dashboard);
router.get("/wallet", controller.wallet);
router.get("/commission-history", controller.commissionHistory);
router.get("/payout-history", controller.payoutHistory);

module.exports = router;
