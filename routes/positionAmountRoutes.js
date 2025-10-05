const express = require("express");
const router = express.Router();
const controller = require("../controllers/positionAmountController");

router.get("/", controller.getAllPositions);
router.get("/:id", controller.getPositionById);
router.post("/", controller.createPositionAmount);
router.put("/:id", controller.updatePositionAmount);
router.delete("/:id", controller.deletePositionAmount);

module.exports = router;
