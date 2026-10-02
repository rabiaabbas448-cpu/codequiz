const Category = require("../models/Category");

// @route  GET /api/categories
// @access Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/categories
// @access Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, order } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      order: Number(order) || 0,
    });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/categories/:id
// @access Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, order } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = Number(order) || 0;

    await category.save();
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };