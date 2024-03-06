const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

const loadproduct = async (req, res) => {
  try {
    const product = await productModel.find({}).populate("categoryId");
    res.render("product", { product });
  } catch (error) {
    console.log(error);
  }
};

const addProduct = async (req, res) => {
  try {
    const categoryData = await categoryModel.find({ is_block: false });
    res.render("addproducts", { categoryData });
  } catch (error) {
    console.log(error);
  }
};

const insertProduct = async (req, res) => {
  try {
    const { name, categoryId, price, stock, description } = req.body;
    const images = req.files.map((file) => file.filename);
    console.log(images);
    const regex = new RegExp("^" + name + "$", "i");
    const exisistingProduct = await productModel.findOne({ name: regex });

    if (exisistingProduct) {
      console.log("this product already exists");
    } else {
      const newProduct = new productModel({
        name,
        categoryId,
        price,
        images,
        quantity: stock,
        description,
      });
      await newProduct.save();
      console.log("category added successfully");
      console.log(newProduct);
    }
    return res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadproduct,
  addProduct,
  insertProduct,
};
