const express = require("express");
const controller = require("./agents.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { profileSchema, payoutSchema, payoutStatusSchema } = require("./agents.validator");

const router = express.Router();

router.use(authenticate);
router.post("/profile", authorize("SUPER_ADMIN", "ADMIN"), validate(profileSchema), controller.upsertProfile);
router.get("/me", authorize("AGENT_VENDOR"), controller.myProfile);
router.get("/commissions", authorize("AGENT_VENDOR"), controller.commissions);
router.post("/payouts/calculate", authorize("AGENT_VENDOR"), validate(payoutSchema), controller.calculateMonthlyPayout);
router.patch("/payouts/:id/status", authorize("SUPER_ADMIN", "ADMIN"), validate(payoutStatusSchema), controller.updatePayoutStatus);

module.exports = router;
