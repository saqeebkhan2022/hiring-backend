const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RoleController");

router.post("/role", RoleController.createRole);
router.get("/roles", RoleController.getAllRoles);   
router.get("/role/:id", RoleController.getRoleById);
router.put("/role/:id", RoleController.updateRole);
router.delete("/role/:id", RoleController.deleteRole);

module.exports = router;
