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
    console.log(name);
    console.log(description);

    const existingCategory = await category.findOne({ name });
    const duplicateName = existingCategory.some(
      (category) => category.name.toLowercase() === name.toLowercase()
    );

    if (duplicateName) {
      return res.json({ exists: true, message: "category alredy exists" });
    } else {
      const newCategory = new category({
        name,
        description,
        is_block: false,
      });
      console.log("hhhhhhhhhh");
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
    if (categoryData) {
      res.render("editCategory", { categories: categoryData });
    } else {
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    console.log(name);
    console.log(description);
    const category = await categoryModel.findOne({ name: name });
    console.log(category);
    if (category && category.name == name) {
      res.render("editCategory", { message: "already exist" });
    } else {
      await categoryModel.updateOne(
        { _id: req.body.id },
        { $set: { name: name, description: description } }
      );
      res.redirect("/admin/category");
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
