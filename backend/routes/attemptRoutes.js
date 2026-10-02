const express = require("express");
const router = express.Router();
const {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getAllAttempts,
} = require("../controllers/attemptController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, submitAttempt);
router.get("/my", protect, getMyAttempts);
router.get("/:id", protect, getAttemptById);
router.get("/", protect, adminOnly, getAllAttempts);

module.exports = router;