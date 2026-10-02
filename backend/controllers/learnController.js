const Category = require("../models/Category");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const Attempt = require("../models/Attempt");
const User = require("../models/User");
const { generateQuestions } = require("../services/aiQuestionService");
const { generateText } = require("../services/geminiClient");
const { getLevelFromXP } = require("../utils/xpUtils");

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SESSION_SIZE = 10; // questions per session
const PASS_PERCENT = 70; // needed to unlock the next level
const XP_PER_CORRECT = 10;
const XP_COMPLETION_BONUS = 5;
const XP_HIGH_SCORE_BONUS = 20; // for 90% or more

const getProgress = async (userId, categoryId) => {
  const progress = await Progress.findOneAndUpdate(
    { user: userId, category: categoryId },
    { $setOnInsert: { user: userId, category: categoryId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return progress;
};

// Random questions WITHOUT the correct answer, so students can't peek
const sampleQuestions = (match) =>
  Question.aggregate([
    { $match: match },
    { $sample: { size: SESSION_SIZE } },
    { $project: { questionText: 1, options: 1, difficulty: 1 } },
  ]);

const evaluateBadges = (user, attemptsCount, percentage) => {
  const newBadges = [];
  const has = (b) => user.badges.includes(b);

  if (attemptsCount >= 1 && !has("First Quiz")) newBadges.push("First Quiz");
  if (attemptsCount >= 5 && !has("5 Quizzes Completed")) newBadges.push("5 Quizzes Completed");
  if (attemptsCount >= 10 && !has("10 Quizzes Completed")) newBadges.push("10 Quizzes Completed");
  if (percentage === 100 && !has("Perfect Score")) newBadges.push("Perfect Score");
  if (attemptsCount >= 10 && !has("Quiz Master")) newBadges.push("Quiz Master");

  return newBadges;
};

// @route  GET /api/learn/topics
// @desc   All languages with this student's unlocked levels and best scores
const getTopics = async (req, res, next) => {
  try {
    const [categories, progresses] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Progress.find({ user: req.user._id }),
    ]);

    const progressByCategory = new Map(progresses.map((p) => [p.category.toString(), p]));

    const topics = categories.map((c) => {
      const p = progressByCategory.get(c._id.toString());
      return {
        _id: c._id,
        name: c.name,
        description: c.description,
        unlockedLevels: p ? p.unlockedLevels : ["Beginner"],
        bestScores: {
          Beginner: p ? p.bestScores.Beginner : 0,
          Intermediate: p ? p.bestScores.Intermediate : 0,
          Advanced: p ? p.bestScores.Advanced : 0,
        },
      };
    });

    res.status(200).json({ topics, passPercent: PASS_PERCENT, sessionSize: SESSION_SIZE });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/learn/start
// @body   { categoryId, difficulty }
const startSession = async (req, res, next) => {
  try {
    const { categoryId, difficulty } = req.body;

    if (!categoryId || !LEVELS.includes(difficulty)) {
      return res.status(400).json({ message: "categoryId and a valid difficulty are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const progress = await getProgress(req.user._id, category._id);
    if (!progress.unlockedLevels.includes(difficulty)) {
      return res.status(403).json({ message: "This level is locked. Complete the previous level first." });
    }

    const pool = { category: category._id, difficulty };
    const unseenMatch = { ...pool, _id: { $nin: Array.from(progress.seenQuestions) } };

    let questions = await sampleQuestions(unseenMatch);

    // Not enough fresh questions for this student: ask the AI to make more
    if (questions.length < SESSION_SIZE) {
      try {
        await generateQuestions(category, difficulty, 10);
      } catch (err) {
        console.error("Top-up generation failed:", err.message);
      }
      questions = await sampleQuestions(unseenMatch);
    }

    // Student has seen everything and AI is unavailable: reuse old questions
    if (questions.length === 0) {
      questions = await sampleQuestions(pool);
    }

    if (questions.length === 0) {
      return res
        .status(503)
        .json({ message: "Questions are not ready right now. Please try again in a minute." });
    }

    res.status(200).json({
      category: { _id: category._id, name: category.name },
      difficulty,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/learn/check
// @body   { questionId, selectedOption }
const checkAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || !Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) {
      return res.status(400).json({ message: "questionId and selectedOption (0-3) are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect = selectedOption === question.correctAnswer;

    // remember that this student has seen this question
    await Progress.updateOne(
      { user: req.user._id, category: question.category },
      { $addToSet: { seenQuestions: question._id } }
    );

    let explanation;

    if (isCorrect) {
      explanation = question.explanation || "Great job! That is the right answer.";
    } else {
      const correctText = question.options[question.correctAnswer];
      const selectedText = question.options[selectedOption];

      const prompt = `You are a friendly coding tutor. A student just answered a quiz question.

Question: ${question.questionText}
Options: ${question.options.map((o, i) => `${i + 1}. ${o}`).join(" | ")}
Correct answer: ${correctText}
Student's answer: ${selectedText}
Result: Incorrect

In 2-4 short sentences, explain why the student's choice is wrong and why the correct option is right. Be kind and encouraging. Plain text only.`;

      try {
        explanation = await generateText(prompt);
      } catch (err) {
        console.error("Live explanation failed:", err.message);
        explanation = question.explanation || `The correct answer is: ${correctText}.`;
      }
    }

    res.status(200).json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation,
    });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/learn/finish
// @body   { categoryId, difficulty, answers: [{ questionId, selectedOption }], timeTaken }
// Scoring is done here on the server, not trusted from the browser.
const finishSession = async (req, res, next) => {
  try {
    const { categoryId, difficulty, answers, timeTaken } = req.body;

    if (
      !categoryId ||
      !LEVELS.includes(difficulty) ||
      !Array.isArray(answers) ||
      answers.length === 0 ||
      answers.length > 20
    ) {
      return res.status(400).json({ message: "categoryId, difficulty and answers are required" });
    }

    const progress = await getProgress(req.user._id, categoryId);
    if (!progress.unlockedLevels.includes(difficulty)) {
      return res.status(403).json({ message: "This level is locked" });
    }

    const questions = await Question.find({
      _id: { $in: answers.map((a) => a.questionId) },
      category: categoryId,
    });
    const byId = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const graded = [];
    const counted = new Set();

    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (!q || counted.has(q._id.toString())) continue;
      counted.add(q._id.toString());

      const selected = Number.isInteger(a.selectedOption) ? a.selectedOption : -1;

      if (selected < 0 || selected > 3) {
        unansweredCount += 1;
        graded.push({ question: q._id, selectedOption: -1, isCorrect: false });
        continue;
      }

      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount += 1;
      else wrongCount += 1;
      graded.push({ question: q._id, selectedOption: selected, isCorrect });
    }

    const total = graded.length;
    if (total === 0) {
      return res.status(400).json({ message: "No valid answers were submitted" });
    }

    const percentage = Math.round((correctCount / total) * 100);

    let xpEarned = correctCount * XP_PER_CORRECT + XP_COMPLETION_BONUS;
    if (percentage >= 90) xpEarned += XP_HIGH_SCORE_BONUS;

    const attempt = await Attempt.create({
      user: req.user._id,
      category: categoryId,
      difficulty,
      answers: graded,
      score: correctCount,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      timeTaken: Math.max(0, Math.round(Number(timeTaken)) || 0),
      xpEarned,
    });

    // Best score + unlock the next level
    const passed = percentage >= PASS_PERCENT;
    let unlockedNext = null;
    const levelIndex = LEVELS.indexOf(difficulty);

    if (percentage > (progress.bestScores[difficulty] || 0)) {
      progress.set(`bestScores.${difficulty}`, percentage);
    }

    if (passed && levelIndex < LEVELS.length - 1) {
      const next = LEVELS[levelIndex + 1];
      if (!progress.unlockedLevels.includes(next)) {
        progress.unlockedLevels.push(next);
        unlockedNext = next;
      }
    }
    await progress.save();

    // XP, level and badges
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = getLevelFromXP(user.xp);

    const attemptsCount = await Attempt.countDocuments({ user: user._id });
    const newBadges = evaluateBadges(user, attemptsCount, percentage);
    if (newBadges.length > 0) user.badges.push(...newBadges);
    await user.save();

    const review = graded.map((g) => {
      const q = byId.get(g.question.toString());
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: g.selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect: g.isCorrect,
        explanation: q.explanation,
      };
    });

    res.status(201).json({
      attemptId: attempt._id,
      score: correctCount,
      total,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      xpEarned,
      passed,
      passPercent: PASS_PERCENT,
      unlockedNext,
      newBadges,
      user: { xp: user.xp, level: user.level, badges: user.badges },
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopics, startSession, checkAnswer, finishSession };