const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const orderModel = require("../models/orderModel");
const product = require("../models/productModel");

const loadLogin = async (req, res) => {
  try {
    res.render("loginAdmin");
  } catch (error) {
    console.log(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === false) {
          res.render("loginAdmin", { message: "your not admin" });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/admindashbord");
        }
      } else {
        res.render("loginAdmin", {
          message: "Email and password is incorrect",
        });
      }
    } else {
      res.render("loginAdmin", { message: "you are not admin" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadDashboard = async (req, res) => {
  try {
    res.render("adminDashbord");
  } catch (error) {
    console.log(error.message);
  }
};

//userList
const userManagement = async (req, res) => {
  try {
    const userData = await User.find();

    res.render("userList", { users: userData });
  } catch (error) {
    console.log(error);
  }
};

const blockUser = async (req, res) => {
  try {
    const user = req.params.id;
    const value = await User.findOne({ _id: user });
    if (value.is_block) {
      await User.updateOne({ _id: user }, { $set: { is_block: false } });
    } else if (value.is_block == false) {
      await User.updateOne({ _id: user }, { $set: { is_block: true } });
    }
    res.json({ block: true });
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

const ordersLoad = async (req, res) => {
  try {
    const orderDetails = await orderModel.find().populate("product.productId");
    res.render("orderList", { orderDetails });
  } catch (error) {
    console.log(error);
  }
};

const orderStatus = async (req, res) => {
  try {
    const { orderId, productId, newStatus } = req.body;

    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, "product._id": productId },
      { $set: { "product.$.productStatus": newStatus } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order or product not found" });
    }

    res.json({ status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadSalesReport = async (req, res) => {
  try {
    const salesReport = await orderModel.find().populate([
      {
        path: "userId",
        model: "User",
        select: "name",
      },
      {
        path: "product.productId",
        model: "product",
      },
    ]);

    let totalSalesAmount = 0;

    salesReport.forEach((order) => {
      order.product.forEach((item) => {
        if (item.productStatus === "Delivered") {
          totalSalesAmount += item.price * item.quantity;
        }
      });
    });

    const totalSales = salesReport.length;

    res.render("sales-report", { salesReport, totalSales, totalSalesAmount });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  userManagement,
  blockUser,
  logout,
  ordersLoad,
  orderStatus,
  loadSalesReport,
};
