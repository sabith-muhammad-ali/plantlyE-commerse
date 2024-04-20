const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const offerModel = require("../models/offerModel");

const loadOffer = async (req, res) => {
  try {
    const offerData = await offerModel.find({});
    res.render("offer", { offerData });
  } catch (error) {
    console.log(error);
  }
};

const loadAddOffer = async (req, res) => {
  try {
    res.render("add-offer");
  } catch (error) {
    console.log(error);
  }
};

const addOffer = async (req, res) => {
  try {
    const addOffer = new offerModel({
      offerName: req.body.name,
      discountAmount: req.body.amount,
      expiryDate: req.body.expiryData,
    });

    await addOffer.save();
    res.redirect("/admin/load-offer");
  } catch (error) {
    console.log(error);
  }
};

const listOffer = async (req, res) => {
  try {
    console.log("hello");
    const offerId = req.params.id;
    console.log("offerId", offerId);
    const offerData = await offerModel.findOne({ _id: offerId });
    if (offerData) {
      const newBlockState = !offerData.isBlocked;
      await offerModel.updateOne(
        { _id: offerId },
        { $set: { isBlocked: newBlockState } }
      );
      res.json({ block: true });
    } else {
      console.log("offer not found ");
    }
  } catch (error) {
    console.log(error);
  }
};

const loadEditOffer = async (req, res) => {
  try {
    const offerId = req.query.id;
    const offerData = await offerModel.findById(offerId);
    res.render("edit-offer", { offerData });
  } catch (error) {
    console.log(error);
  }
};

const editOffer = async (req, res) => {
  try {
    const offerId = req.body.offerId;
    const editOffer = await offerModel.findByIdAndUpdate(
      offerId,
      {
        $set: {
          offerName: req.body.name,
          discountAmount: req.body.amount,
          expiryDate: req.body.expiryData,
        },
      },
      { new: true }
    );
    if (editOffer) {
      return res.redirect("/admin/load-offer");
    }
  } catch (error) {
    console.log(error);
  }
};

const categoryOffer = async (req, res) => {
  try {
    const { categoryId, offerId } = req.body;
    const selectedOffer = await offerModel.findById(offerId);
    console.log("selectedOffer:", selectedOffer);

    // Update the category offer
    const selectedCategory = await categoryModel.findOneAndUpdate(
      { _id: categoryId },
      { $set: { offer: offerId } },
      { new: true }
    );
    console.log("selectedCategory", selectedCategory);

    // Update discount amount for products in the category
    const categoryOffer = await productModel.updateMany(
      { categoryId: categoryId, discountPrice: null },
      { $set: { categoryDiscount: selectedOffer.discountAmount } },
      { new: true }
    );

    console.log("categoryOffer", categoryOffer);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const removeCategoryOffer = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log("req.body:", req.body);
    const selectedCategory = await categoryModel.findOneAndUpdate(
      { _id: categoryId },
      { $unset: { offer: 1 } },
      { new: true }
    );

    console.log("selectedCategory:", selectedCategory);

    await productModel.updateMany(
      { categoryId: categoryId },
      { $unset: { categoryDiscount: 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const productOffer = async (req, res) => {
  try {
    const { productId, offerId } = req.body;
    console.log("req.body:", req.body);
    const selectedProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { offer: offerId } },
      { new: true }
    );
    console.log("selectedProduct:", selectedProduct);

      
    
    const removeCategoryOffer =   await productModel.updateOne(
        { _id: selectedProduct },
        { $unset: { categoryDiscount: null } }
      );

      console.log("removeCategoryOffer",removeCategoryOffer);
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

const removeProductOffer = async (req, res) => {
  try {
    const { selectedProductId } = req.body;
    console.log("req.body:", req.body);
    const selectedProduct = await productModel.findOneAndUpdate(
      { _id: selectedProductId },
      { $unset: { offer: 1 } },
      { new: true }
    );
    console.log("selectedProduct:", selectedProduct);
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadOffer,
  loadAddOffer,
  addOffer,
  listOffer,
  loadEditOffer,
  editOffer,
  categoryOffer,
  removeCategoryOffer,
  productOffer,
  removeProductOffer,
};
