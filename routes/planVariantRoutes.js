const express = require("express");
const router = express.Router();
const variantController = require("../controllers/planVariantController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin ,isConsultant} = require("../middleware/roleMiddleware");

router.post("/", authenticate, isAdmin, variantController.createVariant);
router.get("/", authenticate, isAdmin, variantController.getAllVariants);
router.get("/:id", authenticate, isAdmin, variantController.getVariantById);
router.put("/:id", authenticate, isAdmin, variantController.updateVariant);
router.delete("/:id", authenticate, isAdmin, variantController.deleteVariant);
router.put("/upgrade-plan/:consultantId", authenticate, isConsultant, isAdmin, variantController.updateConsultantPlan);


module.exports = router;
