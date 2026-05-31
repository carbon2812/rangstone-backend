const express = require("express");
const controller = require("./payments.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { orderSchema, verifySchema, refundSchema } = require("./payments.validator");

const router = express.Router();

router.use(authenticate);
router.post("/razorpay/order", validate(orderSchema), controller.createOrder);
router.post("/razorpay/verify", validate(verifySchema), controller.verifyPayment);
router.get("/transactions", authorize("SUPER_ADMIN", "ADMIN"), controller.transactions);
router.post("/refunds", authorize("SUPER_ADMIN", "ADMIN"), validate(refundSchema), controller.createRefund);

module.exports = router;
