const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getPerformance,
  updateProfile,
  getAllStudents,
  getStudentById,
  deleteStudent,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getDashboardStats);
router.get("/performance", protect, getPerformance);
router.put("/profile", protect, updateProfile);

router.get("/", protect, adminOnly, getAllStudents);
router.get("/:id", protect, adminOnly, getStudentById);
router.delete("/:id", protect, adminOnly, deleteStudent);

module.exports = router;