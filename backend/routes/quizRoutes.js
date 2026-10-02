const express = require("express");
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.get("/:id/questions", protect, getQuizQuestions);
router.post("/", protect, adminOnly, createQuiz);
router.put("/:id", protect, adminOnly, updateQuiz);
router.delete("/:id", protect, adminOnly, deleteQuiz);

module.exports = router;