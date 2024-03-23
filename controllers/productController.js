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
  console.log('edit ');
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
    const findProduct = await productModel.findByIdAndUpdate({_id:product},{$pull:{images: imageName}})
    if(findProduct){
      res.json({message:'image is succesfully deleted'})
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
  editProductImage
};
