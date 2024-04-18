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

module.exports = {
  loadOffer,
  loadAddOffer,
  addOffer,
  listOffer,
  loadEditOffer,
  editOffer,
};
