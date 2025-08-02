const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RoleController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/role", authenticate, isAdmin, RoleController.createRole);
router.get("/roles", authenticate, isAdmin, RoleController.getAllRoles);
router.get("/role/:id", authenticate, isAdmin, RoleController.getRoleById);
router.put("/role/:id", authenticate, isAdmin, RoleController.updateRole);
router.delete("/role/:id", authenticate, isAdmin, RoleController.deleteRole);

module.exports = router;
