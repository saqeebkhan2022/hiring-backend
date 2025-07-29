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

router.post("/add", AddUser);
router.get("/all", AllUsers);
router.get("/:id", GetUserById);
router.put("/update-role", UpdateUserRole);
router.put("/:id", UpdateUser);
router.delete("/:id", DeleteUser);

module.exports = router;
