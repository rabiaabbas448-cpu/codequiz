const Question = require("../models/Question");
const { generateText } = require("./geminiClient");

const LEVEL_GUIDE = {
  Beginner: "basic definitions and simple concepts that a complete beginner can answer",
  Intermediate: "concept-based questions, including short code snippets and 'what is the output' questions",
  Advanced: "scenario-based questions, debugging, and code/output analysis that need careful reasoning",
};

const cleanJson = (text) => text.replace(/```json|```/g, "").trim();

// Asks Gemini for MCQs, validates them, and saves the good ones in the database
const generateQuestions = async (category, difficulty, count = 10) => {
  const existing = await Question.find({ category: category._id, difficulty })
    .select("questionText")
    .sort({ createdAt: -1 })
    .limit(40);

  const existingTexts = existing.map((q) => q.questionText);
  const avoid = existingTexts.length
    ? `Do NOT repeat or rephrase any of these existing questions:\n- ${existingTexts.join("\n- ")}\n`
    : "";

  const prompt = `You write quiz questions for a coding-education platform used by school students (Class 6-12) and beginners.

Write exactly ${count} multiple-choice questions about "${category.name}".
Difficulty level: ${difficulty} - ${LEVEL_GUIDE[difficulty]}.

Rules:
- Each question has exactly 4 options and exactly one correct option.
- Spread the correct answer across different positions.
- Keep questions and options short and clear. Plain text only, no markdown.
- Each question must be different from the others.
${avoid}
Return ONLY a JSON array. Each item must look like:
{"questionText": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "1-2 sentences on why the correct option is right"}
correctAnswer is the index (0 to 3) of the correct option.`;

  const text = await generateText(prompt, { responseMimeType: "application/json" });

  let items;
  try {
    items = JSON.parse(cleanJson(text));
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }

  if (!Array.isArray(items)) {
    throw new Error("AI response was not a list");
  }

  const seen = new Set(existingTexts.map((t) => t.toLowerCase()));

  const docs = items
    .filter(
      (q) =>
        q &&
        typeof q.questionText === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o) => typeof o === "string" && o.trim()) &&
        Number.isInteger(q.correctAnswer) &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        !seen.has(q.questionText.trim().toLowerCase())
    )
    .map((q) => ({
      questionText: q.questionText.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: q.correctAnswer,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
      category: category._id,
      difficulty,
      classLevel: "All",
      source: "ai",
    }));

  if (docs.length === 0) {
    throw new Error("AI returned no usable questions");
  }

  return Question.insertMany(docs);
};

module.exports = { generateQuestions };