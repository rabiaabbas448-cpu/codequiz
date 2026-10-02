const express = require("express");
const router = express.Router();
const { explainAnswer, generateForCategory, getQuestionCounts } = require("../controllers/aiController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/explain", protect, explainAnswer);
router.post("/generate", protect, adminOnly, generateForCategory);
router.get("/counts", protect, adminOnly, getQuestionCounts);

module.exports = router;