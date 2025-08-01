const express = require("express");
const router = express.Router();
const variantController = require("../controllers/planVariantController");

router.post("/", variantController.createVariant);
router.get("/", variantController.getAllVariants);
router.get("/:id", variantController.getVariantById);
router.put("/:id", variantController.updateVariant);
router.delete("/:id", variantController.deleteVariant);
router.put("/upgrade-plan/:consultantId", variantController.updateConsultantPlan);


module.exports = router;
