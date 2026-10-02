const Question = require("../models/Question");
const Category = require("../models/Category");
const { generateQuestions } = require("../services/aiQuestionService");
const { generateText } = require("../services/geminiClient");

// @route  POST /api/ai/explain
// @body   { questionId, selectedOption }
// @access Private (student)
const explainAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || selectedOption === undefined) {
      return res.status(400).json({ message: "questionId and selectedOption are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const selectedText = question.options[selectedOption] ?? "No answer selected";
    const correctText = question.options[question.correctAnswer];
    const isCorrect = selectedOption === question.correctAnswer;

    const prompt = `You are a friendly coding tutor explaining a quiz answer to a student.

Question: ${question.questionText}
Options: ${question.options.map((o, i) => `${i + 1}. ${o}`).join(", ")}
Correct answer: ${correctText}
Student's answer: ${selectedText}
Result: ${isCorrect ? "Correct" : "Incorrect"}

Write a short (2-4 sentence), clear, encouraging explanation of why the correct answer is right. If the student was wrong, gently explain the misunderstanding. Do not repeat the question text back.`;

    const explanation = await generateText(prompt);

    res.status(200).json({ explanation, isCorrect });
  } catch (error) {
    console.error("AI explain error:", error.message);
    res.status(500).json({ message: "Could not generate explanation right now. Please try again." });
  }
};

// @route  POST /api/ai/generate
// @body   { categoryId, difficulty, count }
// @access Private/Admin
const generateForCategory = async (req, res, next) => {
  try {
    const { categoryId, difficulty, count } = req.body;

    if (!categoryId || !["Beginner", "Intermediate", "Advanced"].includes(difficulty)) {
      return res.status(400).json({ message: "categoryId and a valid difficulty are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const howMany = Math.min(Math.max(Number(count) || 10, 1), 15);
    const created = await generateQuestions(category, difficulty, howMany);

    res.status(201).json({ created: created.length, questions: created });
  } catch (error) {
    console.error("AI generate error:", error.message);
    res.status(500).json({ message: "Could not generate questions right now. Please try again." });
  }
};
// @route  GET /api/ai/counts
// @desc   How many AI-generated questions exist per category/difficulty
// @access Private/Admin
const getQuestionCounts = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    const counts = await Question.aggregate([
      { $match: { source: "ai" } },
      { $group: { _id: { category: "$category", difficulty: "$difficulty" }, count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      const key = `${c._id.category}-${c._id.difficulty}`;
      countMap[key] = c.count;
    });

    const result = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      counts: {
        Beginner: countMap[`${cat._id}-Beginner`] || 0,
        Intermediate: countMap[`${cat._id}-Intermediate`] || 0,
        Advanced: countMap[`${cat._id}-Advanced`] || 0,
      },
    }));

    res.status(200).json({ categories: result });
  } catch (error) {
    next(error);
  }
};
module.exports = { explainAnswer, generateForCategory, getQuestionCounts };