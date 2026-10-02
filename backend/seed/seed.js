require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/User");
const Category = require("../models/Category");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

const CATEGORY_NAMES = [
  "Computer Fundamentals",
  "Programming Basics",
  "HTML",
  "CSS",
  "JavaScript",
  "Python",
  "Web Development",
  "Database Basics",
  "Logical Thinking",
];

// Generates 10 simple placeholder questions for a given category/difficulty/classLevel
const buildQuestions = (categoryId, categoryName, difficulty, classLevel) => {
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push({
      questionText: `[${categoryName} - ${difficulty}] Sample question ${i}: which option is correct?`,
      options: [`Option A (${i})`, `Option B (${i})`, `Option C (${i})`, `Option D (${i})`],
      correctAnswer: 0,
      explanation: `Option A is correct because this is placeholder seed data for ${categoryName}.`,
      category: categoryId,
      difficulty,
      classLevel,
    });
  }
  return questions;
};

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Attempt.deleteMany({}),
    ]);

    console.log("Creating categories...");
    const categories = await Category.insertMany(
      CATEGORY_NAMES.map((name) => ({ name, description: `${name} quizzes` }))
    );

    console.log("Creating admin account...");
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const admin = await User.create({
      name: "Admin",
      email: "admin@codequiz.com",
      password: adminPassword,
      role: "admin",
    });

    console.log("Creating sample students...");
    const studentPassword = await bcrypt.hash("Student@123", 10);
    await User.insertMany([
      {
        name: "Ali Raza",
        email: "student1@codequiz.com",
        password: studentPassword,
        role: "student",
        classLevel: "Class 9",
      },
      {
        name: "Sara Khan",
        email: "student2@codequiz.com",
        password: studentPassword,
        role: "student",
        classLevel: "Class 10",
      },
      {
        name: "Bilal Ahmed",
        email: "student3@codequiz.com",
        password: studentPassword,
        role: "student",
        classLevel: "Beginner / Self Learner",
      },
    ]);

    console.log("Creating quizzes with questions...");
    const quizDefs = [
      { catName: "HTML", difficulty: "Beginner", classLevel: "Class 9", timeLimit: 10 },
      { catName: "CSS", difficulty: "Beginner", classLevel: "Class 9", timeLimit: 10 },
      { catName: "JavaScript", difficulty: "Intermediate", classLevel: "Class 10", timeLimit: 15 },
      { catName: "Python", difficulty: "Beginner", classLevel: "Beginner / Self Learner", timeLimit: 12 },
      { catName: "Computer Fundamentals", difficulty: "Beginner", classLevel: "Class 6", timeLimit: 8 },
    ];

    for (const def of quizDefs) {
      const category = categories.find((c) => c.name === def.catName);
      const questionDocs = buildQuestions(category._id, category.name, def.difficulty, def.classLevel);
      const insertedQuestions = await Question.insertMany(questionDocs);

      await Quiz.create({
        title: `${def.catName} - ${def.difficulty} Quiz`,
        description: `Test your ${def.catName} knowledge at ${def.difficulty} level.`,
        category: category._id,
        difficulty: def.difficulty,
        classLevel: def.classLevel,
        timeLimit: def.timeLimit,
        questions: insertedQuestions.map((q) => q._id),
        status: "active",
        createdBy: admin._id,
      });
    }

    console.log("\nSeed complete!");
    console.log("Admin login: admin@codequiz.com / Admin@123");
    console.log("Student logins: student1@codequiz.com / Student@123 (student2, student3 bhi)");
    console.log("Change these credentials after testing.\n");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();