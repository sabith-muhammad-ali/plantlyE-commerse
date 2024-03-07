const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const sharp = require("sharp");

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
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          await sharp(`public/assets/multer/${images[i]}`)
            .resize(500, 500)
            .toFile(`public/assets/sharp/${images[i]}`);
        }
      }
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

const productblock = async (req, res) => {
  try {
    console.log("louy");
    const productId = req.params.id;
    const productValue = await productModel.findOne({ _id: productId });
    if (productValue) {
      const newBlockState = !productValue.is_blocked;
      await productModel.updateOne(
        { _id: productId },
        { $set: { is_blocked: newBlockState } }
      );
      res.json({ block: true });
    } else {
      console.log("product not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error " });
  }
};

const loadeditproduct = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    const id = req.query.id;
    const productData = await productModel.findById(id).populate("categoryId");
    console.log(productData,id);
    res.render("editProduct", { productData, category });
  } catch (error) {
    console.log(error); 
  }
};
const productedit = async (req,res) => {

}


module.exports = {
  loadproduct,
  addProduct,
  insertProduct,
  productblock,
  loadeditproduct,
  productedit
};
