const express = require("express");
const router = express.Router();
const {
  AddUser,
  UpdateUserRole,
  AllUsers,
  GetUserById,
  UpdateUser,
  DeleteUser,
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/add", authenticate, isAdmin, AddUser);
router.get("/all", authenticate, isAdmin, AllUsers);
router.get("/:id", authenticate, isAdmin, GetUserById);
router.put("/update-role", authenticate, isAdmin, UpdateUserRole);
router.put("/:id", authenticate, isAdmin, UpdateUser);
router.delete("/:id", authenticate, isAdmin, DeleteUser);

module.exports = router;
