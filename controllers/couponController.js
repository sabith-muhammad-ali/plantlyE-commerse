const cartModel = require("../models/cartModel");
const couponModel = require("../models/couponModel");



const loadCoupon = async (req,res) => {
    try {
        res.render("coupon");
    } catch (error) {
        console.log(error)
    }
}

const loadAddCoupon = async (req,res) => {
    try {
        res.render("add-Coupons");
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    loadCoupon,
    loadAddCoupon,
}