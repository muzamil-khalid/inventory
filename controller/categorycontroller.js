const Product = require("../models/Productmodel");

/** 🔥 FIXED PATH + CASE */
const Category = require("../models/CategoryModel");

const logActivity = require("../libs/logger");
const StockTransaction = require("../models/StockTranscationmodel");

/* ================= CREATE CATEGORY ================= */
module.exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?._id;
    const ipAddress = req.ip;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const newCategory = new Category({ name, description });
    await newCategory.save();

    await logActivity({
      action: "Add Category",
      description: `Category "${name}" was added`,
      entity: "category",
      entityId: newCategory._id,
      userId,
      ipAddress,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

/* ================= REMOVE CATEGORY ================= */
module.exports.RemoveCategory = async (req, res) => {
  try {
    const { CategoryId } = req.params;
    const userId = req.user?._id;
    const ipAddress = req.ip;

    const deletedCategory = await Category.findByIdAndDelete(CategoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await logActivity({
      action: "Delete Category",
      description: `Category "${deletedCategory.name}" was deleted`,
      entity: "category",
      entityId: deletedCategory._id,
      userId,
      ipAddress,
    });

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};

/* ================= GET ALL CATEGORIES ================= */
module.exports.getCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({});

    if (!allCategory.length) {
      return res.status(404).json({
        message: "No categories found",
      });
    }

    const categoriesWithCount = await Promise.all(
      allCategory.map(async (category) => {
        const count = await Product.countDocuments({
          Category: category._id,
        });

        return {
          ...category.toObject(),
          productCount: count,
        };
      })
    );

    res.status(200).json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({
      message: "Error getting categories",
      error: error.message,
    });
  }
};

/* ================= UPDATE CATEGORY ================= */
module.exports.updateCategory = async (req, res) => {
  try {
    const { CategoryId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?._id;
    const ipAddress = req.ip;

    const updatedCategory = await Category.findByIdAndUpdate(
      CategoryId,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await logActivity({
      action: "Update Category",
      description: `Category "${updatedCategory.name}" was updated`,
      entity: "category",
      entityId: updatedCategory._id,
      userId,
      ipAddress,
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      message: "Error updating category",
      error: error.message,
    });
  }
};

/* ================= SEARCH CATEGORY ================= */
module.exports.Searchcategory = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const categories = await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Error searching category",
      error: error.message,
    });
  }
};
