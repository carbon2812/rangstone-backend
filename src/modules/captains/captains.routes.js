const express = require("express");
const controller = require("./captains.controller");
const validate = require("../../middlewares/validateMiddleware");
const { authenticate, authorize } = require("../../middlewares/authMiddleware");
const { profileSchema, verifyTicketSchema } = require("./captains.validator");

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("SUPER_ADMIN", "ADMIN"), validate(profileSchema), controller.createProfile);
router.get("/assigned-trips", authorize("CAPTAIN"), controller.assignedTrips);
router.post("/verify-ticket", authorize("CAPTAIN"), validate(verifyTicketSchema), controller.verifyTicket);

module.exports = router;
