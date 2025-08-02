const express = require("express");
const router = express.Router();
const consultantController = require("../controllers/ConsultantController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin ,isConsultant} = require("../middleware/roleMiddleware");


router.get("/count",authenticate, consultantController.TotalConsultantCount);
// Create consultant (also creates user)
router.post("/add", authenticate, isAdmin, consultantController.AddConsultant);

// Get all consultants with user info
router.get("/all", authenticate, isAdmin, consultantController.AllConsultant);

// Get consultant by ID
router.get("/:id", authenticate, isAdmin,isConsultant, consultantController.GetConsultantById);

// Update consultant
router.put("/:id", authenticate, isAdmin, consultantController.UpdateConsultant);

// Delete consultant
router.delete("/:id", authenticate, isAdmin, consultantController.DeleteConsultant);

router.get("/count", authenticate, consultantController.TotalConsultantCount);

router.get("/count/pending", authenticate,isAdmin, consultantController.PendingConsultantCount);

router.get("/count/active", authenticate,isAdmin, consultantController.ActiveConsultantCount);

router.get("/count/rejected", authenticate,isAdmin, consultantController.RejectedConsultantCount);



module.exports = router;    