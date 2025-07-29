const express = require("express");
const router = express.Router();
const consultantController = require("../controllers/ConsultantController");


router.get("/count", consultantController.TotalConsultantCount);
// Create consultant (also creates user)
router.post("/add", consultantController.AddConsultant);

// Get all consultants with user info
router.get("/all", consultantController.AllConsultant);

// Get consultant by ID
router.get("/:id", consultantController.GetConsultantById);

// Update consultant
router.put("/:id", consultantController.UpdateConsultant);

// Delete consultant
router.delete("/:id", consultantController.DeleteConsultant);

router.get("/count", consultantController.TotalConsultantCount);


module.exports = router;
