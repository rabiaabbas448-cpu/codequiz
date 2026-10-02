const Quiz = require("../models/Quiz");

// @route  GET /api/quizzes
// @query  category, difficulty, classLevel
// @access Public (students browse quizzes)
const getQuizzes = async (req, res, next) => {
  try {
    const { category, difficulty, classLevel } = req.query;
    const filter = { status: "active" };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (classLevel) filter.classLevel = classLevel;

    const quizzes = await Quiz.find(filter)
      .populate("category", "name")
      .select("-questions")
      .sort({ createdAt: -1 });

    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const full = await Quiz.findById(quiz._id).select("questions");
        return { ...quiz.toObject(), questionCount: full.questions.length };
      })
    );

    res.status(200).json({ quizzes: quizzesWithCount });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quizzes/:id
// @desc   Quiz instructions view - metadata only, NOT questions/answers
// @access Public
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("category", "name");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        classLevel: quiz.classLevel,
        timeLimit: quiz.timeLimit,
        questionCount: quiz.questions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/quizzes/:id/questions
// @desc   Questions for attempt - correctAnswer & explanation stripped
// @access Private (student)
const getQuizQuestions = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate({
      path: "questions",
      select: "questionText options category difficulty",
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.questions.length === 0) {
      return res.status(400).json({ message: "This quiz has no questions yet" });
    }

    res.status(200).json({
      quizId: quiz._id,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions,
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/quizzes
// @access Private/Admin
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, classLevel, timeLimit, questions, status } = req.body;

    if (!title || !category || !difficulty || !classLevel || !timeLimit) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      classLevel,
      timeLimit,
      questions: questions || [],
      status: status || "active",
      createdBy: req.user._id,
    });

    res.status(201).json({ quiz });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/quizzes/:id
// @access Private/Admin
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.status(200).json({ quiz });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/quizzes/:id
// @access Private/Admin
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quiz.deleteOne();
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  getQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};