const express = require("express");
const controller = require("./adminAgents.controller");
const validateZod = require("../../middlewares/zodValidateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const {
  idParam,
  permissionSchema,
  commissionRuleSchema,
  payoutCreateSchema,
  payoutActionSchema,
  payoutListSchema
} = require("./agentManagement.validator");

const router = express.Router();
const adminOnly = authorize("SUPER_ADMIN", "ADMIN");

router.use(authenticate, adminOnly);

router.get("/dashboard/agents", controller.metrics);
router.get("/agents", controller.listAgents);
router.get("/agents/:id", validateZod(idParam), controller.getAgent);
router.get("/agents/:id/permissions", validateZod(idParam), controller.getPermissions);
router.put("/agents/:id/permissions", validateZod(permissionSchema), controller.updatePermissions);
router.get("/agents/:id/commission-rules", validateZod(idParam), controller.getCommissionRules);
router.put("/agents/:id/commission-rules", validateZod(commissionRuleSchema), controller.updateCommissionRules);
router.get("/agents/:id/wallet", validateZod(idParam), controller.getWallet);
router.get("/agents/:id/transactions", validateZod(idParam), controller.getTransactions);
router.get("/payouts", validateZod(payoutListSchema), controller.listPayouts);
router.post("/payouts", validateZod(payoutCreateSchema), controller.createPayout);
router.patch("/payouts/:id/approve", validateZod(payoutActionSchema), controller.approvePayout);
router.patch("/payouts/:id/pay", validateZod(payoutActionSchema), controller.payPayout);

module.exports = router;
