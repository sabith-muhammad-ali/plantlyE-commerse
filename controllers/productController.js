const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const offerModel = require("../models/offerModel");
const sharp = require("sharp");

const loadproduct = async (req, res) => {
  try {
    const offerData = await offerModel.find({});
    const products = await productModel
      .find({})
      .populate("categoryId")
      .populate("offer");

    for (const productData of products) {
      let discountPrice = productData.price; // Initialize discountPrice with the original price

      console.log("Product:", productData);

      // Check if there's an offer associated with the category
      if (
        productData.categoryId.offer &&
        typeof productData.categoryId.offer.discountAmount === "number"
      ) {
        console.log("Category offer applied");
        discountPrice -=
          productData.price * productData.categoryId.offer.discountAmount;
      }
      // Check if there's a direct offer associated with the product
      else if (
        productData.offer &&
        typeof productData.offer.discountAmount === "number"
      ) {
        console.log("Product offer applied");
        discountPrice -= productData.offer.discountAmount; // Corrected the calculation here
      }

      // Ensure discountPrice is not negative
      discountPrice = Math.max(discountPrice, 0);

      // Update discountPrice field
      productData.discountPrice = parseInt(discountPrice);

      console.log("Discounted Price:", productData.discountPrice);

      // Save product data
      await productData.save();
    }

    res.render("product", { products, offerData });
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
    }
    return res.redirect("/admin/product");
  } catch (error) {
    console.log(error);
  }
};

const productblock = async (req, res) => {
  try {
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
    res.render("editProduct", { productData, category });
  } catch (error) {
    console.log(error);
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.body.productId;
    const { name, categoryId, price, stock, description } = req.body;
    const images = req.files.map((file) => file.filename);

    // Resize and store images using sharp
    for (let i = 0; i < images.length; i++) {
      await sharp(`public/assets/multer/${images[i]}`)
        .resize(500, 500)
        .toFile(`public/assets/sharp/${images[i]}`);
    }

    const update = await productModel.findByIdAndUpdate(
      productId,
      {
        $set: {
          name,
          categoryId,
          price,
          quantity: stock,
          description,
        },
        $push: {
          images: { $each: images },
        },
      },
      { new: true }
    );

    if (update) {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error);
  }
};

const editProductImage = async (req, res) => {
  try {
    const product = req.body.productId;
    const imageName = req.body.imageName;
    const findProduct = await productModel.findByIdAndUpdate(
      { _id: product },
      { $pull: { images: imageName } }
    );
    if (findProduct) {
      res.json({ message: "image is succesfully deleted" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadproduct,
  addProduct,
  insertProduct,
  productblock,
  loadeditproduct,
  editProduct,
  editProductImage,
};
