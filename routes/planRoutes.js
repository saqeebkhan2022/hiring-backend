const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin} = require("../middleware/roleMiddleware");

router.post("/", authenticate, isAdmin, planController.createPlan);
router.get("/", authenticate, isAdmin, planController.getAllPlans);
router.get("/:id", authenticate, isAdmin, planController.getPlanById);
router.put("/:id", authenticate, isAdmin, planController.updatePlan);
router.delete("/:id", authenticate, isAdmin, planController.deletePlan);

module.exports = router;
