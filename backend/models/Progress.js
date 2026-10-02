const mongoose = require("mongoose");

// Tracks one student's progress in one category (language)
const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    unlockedLevels: {
      type: [String],
      default: ["Beginner"],
    },
    bestScores: {
      Beginner: { type: Number, default: 0 },
      Intermediate: { type: Number, default: 0 },
      Advanced: { type: Number, default: 0 },
    },
    // questions this student has already answered, so they are not repeated
    seenQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);