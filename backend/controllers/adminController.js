const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const Category = require("../models/Category");

// @route  GET /api/admin/stats
// @access Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [totalStudents, totalCategories, totalQuizzes, totalQuestions, totalAttempts, attempts] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Category.countDocuments(),
        Quiz.countDocuments(),
        Question.countDocuments(),
        Attempt.countDocuments(),
        Attempt.find().select("percentage"),
      ]);

    const averageScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

    res.status(200).json({
      totalStudents,
      totalCategories,
      totalQuizzes,
      totalQuestions,
      totalAttempts,
      averageScore,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/admin/public-stats
// @access Public (used on the home page)
const getPublicStats = async (req, res, next) => {
  try {
    const [totalCategories, totalQuestions] = await Promise.all([
      Category.countDocuments(),
      Question.countDocuments(),
    ]);
    res.status(200).json({ totalCategories, totalQuestions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminStats, getPublicStats };