const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length === 4;
        },
        message: "Exactly 4 options are required",
      },
      required: true,
    },
    correctAnswer: {
      type: Number, // index 0-3 into options array
      required: [true, "Correct answer index is required"],
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
      default: "All",
    },
    source: {
      type: String,
      enum: ["admin", "ai"],
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);