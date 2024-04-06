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
    const regex = new RegExp("^" + name + "$", "i");
    // Generate a random coupon code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let couponCode = "";
    const codeLength = 8;
    for (let i = 0; i < codeLength; i++) {
      couponCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    const existingCoupon = await couponModel.findOne({ name: regex });
    if (existingCoupon) {
      return res.json({ exists: true, message: "Coupon already exists" });
    } else {
      const newCoupon = new couponModel({
        name,
        discountAmount,
        criteriaAmount,
        expiryDate,
        couponCode,
      });
      await newCoupon.save();
      return res.json({
        success: true,
        message: "Coupon addedd successfully",
      });
    }
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
      res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.log(error);
  }
};

const removeCoupon = async (req, res) => {
  try {
    console.log("looosssss");
    const couponId = req.body.coupon;
    console.log("couponId", couponId);
    await couponModel.deleteOne({ _id: couponId });
    res.json({ remove: true });
  } catch (error) {
    console.log(error);
  }
};

const redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userId = req.session.userId;
    const currentData = new Date();

    const couponData = await couponModel.findOne({
      _id: couponId,
      expiryDate: { $gte: currentData },
      isBlocked: false,
    });

    const iscouponUsed = couponData.usedUsers.includes(userId);

    if (!iscouponUsed) {
      const existingCart = await cartModel.findOne({ user: userId });
      if (existingCart && existingCart.couponDiscount == null) {
        await couponModel.findOneAndUpdate(
          { _id: couponId },
          { $push: { usedUsers: userId } }
        );

        await cartModel.findOneAndUpdate(
          { user: userId },
          { $set: { couponDiscount: couponData._id } }
        );

        res.json({ coupon: true });
      } else {
        res.json({ coupon: "alreadyApplied" });
      }
    } else {
      res.json({ coupon: "alreadyUsed" });
    }
  } catch (error) {
    console.error(error);
  }
};

const revokeCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userId = req.session.userId;
    await cartModel.findOne({ user: userId });
    await couponModel.findByIdAndUpdate(
      { _id: couponId },
      { $pull: { usedUsers: userId } }
    );
    res.json({ coupone: true });
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
  removeCoupon,
  redeemCoupon,
  revokeCoupon,
};
