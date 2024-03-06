const categoryModel = require("../models/categoryModel");
const category = require("../models/categoryModel");

const productCategory = async (req, res) => {
  try {
    const categories = await category.find();
    res.render("category", { categories });
  } catch (error) {
    console.log(error);
  }
};

const addCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error);
  }
};

const insertCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const regex = new RegExp("^" + name + "$", "i");
    const existingCategory = await category.findOne({ name: regex });
    if (existingCategory) {
      return res.json({ exists: true, message: "Category already exists" });
    } else {
      const newCategory = new category({
        name,
        description,
        is_block: false,
      });

      await newCategory.save();

      return res.json({
        success: true,
        message: "Category added successfully",
      });
    }
  } catch (error) {
    console.error(error, "error insert the category");
    // Send an error response if something went wrong
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const Categoryblock = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryValue = await categoryModel.findOne({ _id: categoryId });
    if (categoryValue) {
      const newBlockState = !categoryValue.is_block;
      await categoryModel.updateOne(
        { _id: categoryId },
        { $set: { is_block: newBlockState } }
      );
    } else {
      console.log("Category not found");
    }
    res.json({ block: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await category.findById({ _id: id });
    res.render("editCategory", { categories: categoryData });
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const category = await categoryModel.findOne({ name: name });
    if (category) {
      return res.json({ ok: false });
    } else {
      await categoryModel.updateOne(
        { _id: id },
        { $set: { name: name, description: description } },
        { new: true }
      );
      return res.json({ ok: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  productCategory,
  addCategory,
  insertCategory,
  Categoryblock,
  editCategory,
  updateCategory,
};
