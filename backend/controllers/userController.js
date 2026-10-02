const User = require("../models/User");
const Attempt = require("../models/Attempt");
const { getXPProgress } = require("../utils/xpUtils");

// @route  GET /api/users/dashboard
// @access Private (student)
const getDashboardStats = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
        : 0;
    const bestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    const recentAttempts = attempts.slice(0, 5);

    res.status(200).json({
      name: req.user.name,
      classLevel: req.user.classLevel,
      xp: req.user.xp,
      level: req.user.level,
      xpProgress: getXPProgress(req.user.xp),
      badges: req.user.badges,
      totalAttempts,
      averageScore,
      bestScore,
      recentAttempts,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users/performance
// @access Private (student)
// @route  GET /api/users/performance
// @desc   Category-wise and difficulty-wise breakdown for charts
// @access Private (student)
const getPerformance = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate("category", "name")
      .populate({ path: "quiz", select: "category difficulty", populate: { path: "category", select: "name" } })
      .sort({ createdAt: 1 });

    const categoryMap = {};
    const difficultyMap = {};

    attempts.forEach((a) => {
      // new learn-system attempts store category/difficulty directly;
      // older quiz-based attempts have them under a.quiz
      const catName = a.category?.name || a.quiz?.category?.name || "Unknown";
      const diff = a.difficulty || a.quiz?.difficulty || "Unknown";

      if (!categoryMap[catName]) categoryMap[catName] = { count: 0, totalPercent: 0 };
      categoryMap[catName].count += 1;
      categoryMap[catName].totalPercent += a.percentage;

      if (!difficultyMap[diff]) difficultyMap[diff] = { count: 0, totalPercent: 0 };
      difficultyMap[diff].count += 1;
      difficultyMap[diff].totalPercent += a.percentage;
    });

    const categoryPerformance = Object.entries(categoryMap).map(([name, v]) => ({
      category: name,
      attempts: v.count,
      averagePercentage: Math.round(v.totalPercent / v.count),
    }));

    const difficultyPerformance = Object.entries(difficultyMap).map(([name, v]) => ({
      difficulty: name,
      attempts: v.count,
      averagePercentage: Math.round(v.totalPercent / v.count),
    }));

    const progressOverTime = attempts.map((a) => ({
      date: a.createdAt,
      percentage: a.percentage,
    }));

    const overallAverage =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;
    const bestCategory = categoryPerformance.length
      ? categoryPerformance.reduce((best, c) => (c.averagePercentage > best.averagePercentage ? c : best))
      : null;

    res.status(200).json({
      categoryPerformance,
      difficultyPerformance,
      progressOverTime,
      overallAverage,
      totalAttempts: attempts.length,
      bestCategory,
    });
  } catch (error) {
    next(error);
  }
};
// @route  PUT /api/users/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, classLevel } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (classLevel) user.classLevel = classLevel;

    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users
// @access Private/Admin
const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 });
    res.status(200).json({ students });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/users/:id
// @access Private/Admin
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const attempts = await Attempt.find({ user: student._id }).sort({ createdAt: -1 });
    res.status(200).json({ student, attempts });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    await student.deleteOne();
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPerformance,
  updateProfile,
  getAllStudents,
  getStudentById,
  deleteStudent,
};