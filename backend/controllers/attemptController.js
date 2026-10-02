const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const User = require("../models/User");
const { getLevelFromXP } = require("../utils/xpUtils");

const XP_PER_CORRECT = 10;
const XP_COMPLETION_BONUS = 5;
const XP_HIGH_SCORE_BONUS = 20; // awarded for >= 90%

// Awards badges based on the user's updated stats. Returns newly earned badge names.
const evaluateBadges = async (user, attemptsCount, percentage) => {
  const newBadges = [];
  const has = (b) => user.badges.includes(b);

  if (attemptsCount === 1 && !has("First Quiz")) newBadges.push("First Quiz");
  if (attemptsCount === 5 && !has("5 Quizzes Completed")) newBadges.push("5 Quizzes Completed");
  if (attemptsCount === 10 && !has("10 Quizzes Completed")) newBadges.push("10 Quizzes Completed");
  if (percentage === 100 && !has("Perfect Score")) newBadges.push("Perfect Score");
  if (attemptsCount >= 10 && !has("Quiz Master")) newBadges.push("Quiz Master");

  return newBadges;
};

// @route  POST /api/attempts
// @body   { quizId, answers: [{ questionId, selectedOption }], timeTaken }
// @access Private (student)
const submitAttempt = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken } = req.body;

    if (!quizId || !Array.isArray(answers) || timeTaken === undefined) {
      return res.status(400).json({ message: "quizId, answers and timeTaken are required" });
    }

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({ message: "This quiz has no questions" });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const gradedAnswers = quiz.questions.map((question) => {
      const submitted = answers.find((a) => a.questionId === question._id.toString());
      const selectedOption = submitted ? submitted.selectedOption : -1;

      if (selectedOption === -1 || selectedOption === undefined || selectedOption === null) {
        unansweredCount += 1;
        return { question: question._id, selectedOption: -1, isCorrect: false };
      }

      const isCorrect = selectedOption === question.correctAnswer;
      if (isCorrect) correctCount += 1;
      else wrongCount += 1;

      return { question: question._id, selectedOption, isCorrect };
    });

    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    let xpEarned = correctCount * XP_PER_CORRECT + XP_COMPLETION_BONUS;
    if (percentage >= 90) xpEarned += XP_HIGH_SCORE_BONUS;

    const attempt = await Attempt.create({
      user: req.user._id,
      quiz: quiz._id,
      answers: gradedAnswers,
      score,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      timeTaken,
      xpEarned,
    });

    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = getLevelFromXP(user.xp);

    const attemptsCount = await Attempt.countDocuments({ user: user._id });
    const newBadges = await evaluateBadges(user, attemptsCount, percentage);
    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
    }
    await user.save();

    res.status(201).json({
      attempt,
      xpEarned,
      newBadges,
      user: { xp: user.xp, level: user.level, badges: user.badges },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/attempts/my
// @access Private (student)
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate({ path: "quiz", select: "title category difficulty", populate: { path: "category", select: "name" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/attempts/:id
// @desc   Full review with correct answers/explanations (only for the owner or admin)
// @access Private
const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: "answers.question",
        select: "questionText options correctAnswer explanation",
      })
      .populate({ path: "quiz", select: "title category difficulty", populate: { path: "category", select: "name" } });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const isOwner = attempt.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ attempt });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/attempts
// @access Private/Admin
const getAllAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find()
      .populate("user", "name email classLevel")
      .populate({ path: "quiz", select: "title category", populate: { path: "category", select: "name" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ attempts });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitAttempt, getMyAttempts, getAttemptById, getAllAttempts };