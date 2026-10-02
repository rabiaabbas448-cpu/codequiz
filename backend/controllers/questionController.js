const Question = require("../models/Question");

// @route  GET /api/questions
// @query  category, difficulty, classLevel (all optional filters)
// @access Private/Admin
const getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, classLevel, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (classLevel) filter.classLevel = classLevel;
    if (search) filter.questionText = { $regex: search, $options: "i" };

    const questions = await Question.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ questions });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/questions/:id
// @access Private/Admin
const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate("category", "name");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

const validateQuestionBody = (body) => {
  const { questionText, options, correctAnswer, category, difficulty, classLevel } = body;

  if (!questionText || !options || correctAnswer === undefined || !category || !difficulty || !classLevel) {
    return "All required fields must be provided";
  }
  if (!Array.isArray(options) || options.length !== 4) {
    return "Exactly 4 options are required";
  }
  if (correctAnswer < 0 || correctAnswer > 3) {
    return "correctAnswer must be an index between 0 and 3";
  }
  if (!["Beginner", "Intermediate", "Advanced"].includes(difficulty)) {
    return "Invalid difficulty value";
  }
  return null;
};

// @route  POST /api/questions
// @access Private/Admin
const createQuestion = async (req, res, next) => {
  try {
    const error = validateQuestionBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/questions/:id
// @access Private/Admin
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    Object.assign(question, req.body);
    await question.save();

    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/questions/:id
// @access Private/Admin
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};