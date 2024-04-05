const bannerModel = require("../models/bannerModel");
const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");

const loadCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.find({});
    res.render("coupon", { coupon });
  } catch (error) {
    console.log(error);
  }
};

const loadAddCoupon = async (req, res) => {
  try {
    res.render("add-Coupons");
  } catch (error) {
    console.log(error);
  }
};

const addCoupon = async (req, res) => {
  try {
    const { name, discountAmount, criteriaAmount, expiryDate } = req.body;

    // Generate a random coupon code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let couponCode = "";
    const codeLength = 8;
    for (let i = 0; i < codeLength; i++) {
      couponCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    const newCoupon = new couponModel({
      name,
      discountAmount,
      criteriaAmount,
      expiryDate,
      couponCode,
    });
    await newCoupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
  }
};

const loadEditCoupon = async (req, res) => {
  try {
    const id = req.query.couponId;
    const coupon = await couponModel.findById(id);
    res.render("edit-coupon", { coupon });
  } catch (error) {
    console.log(error);
  }
};

const editCoupon = async (req, res) => {
  try {
    const couponId = req.body.couponId;
    const { name, discountAmount, criteriaAmount, expiryDate } = req.body;
    const update = await couponModel.findByIdAndUpdate(
      couponId,
      {
        $set: {
          name,
          discountAmount,
          criteriaAmount,
          expiryDate,
        },
      },
      { new: true }
    );
    if (update) {
        res.redirect("/admin/coupon")
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCoupon,
  loadAddCoupon,
  addCoupon,
  loadEditCoupon,
  editCoupon,
};
