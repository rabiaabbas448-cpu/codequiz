const express = require("express");
const router = express.Router();
const {
  getTopics,
  startSession,
  checkAnswer,
  finishSession,
} = require("../controllers/learnController");
const { protect } = require("../middleware/authMiddleware");

router.get("/topics", protect, getTopics);
router.post("/start", protect, startSession);
router.post("/check", protect, checkAnswer);
router.post("/finish", protect, finishSession);

module.exports = router;