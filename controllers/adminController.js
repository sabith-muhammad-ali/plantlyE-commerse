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

const filterSalesReport = async (req, res) => {
  try {
    let fromdate, todate;
    const currentDate = new Date();

    const range = req.body.range;
    switch (range) {
      case "daily":
        fromdate = new Date(currentDate);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(currentDate);
        todate.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        const currentDateCopy = new Date(currentDate);
        const firstDayOfWeek = new Date(
          currentDateCopy.setDate(
            currentDateCopy.getDate() - currentDateCopy.getDay()
          )
        );
        const lastDayOfWeek = new Date(
          currentDateCopy.setDate(currentDateCopy.getDate() + 6)
        ); // Saturday
        fromdate = new Date(firstDayOfWeek);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(lastDayOfWeek);
        todate.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        fromdate = new Date(firstDayOfMonth);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(lastDayOfMonth);
        todate.setHours(23, 59, 59, 999);
        break;
      case "yearly":
        const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(currentDate.getFullYear() + 1, 0, 0);
        fromdate = new Date(firstDayOfYear);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(lastDayOfYear);
        todate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        fromdate = req.body.fromdate ? new Date(req.body.fromdate) : null;
        if (fromdate) fromdate.setHours(0, 0, 0, 0);
        todate = req.body.todate ? new Date(req.body.todate) : null;
        if (todate) todate.setHours(23, 59, 59, 999);
        break;
    }

    const salesReport = await orderModel
      .find({
        orderedData: {
          $lt: todate || currentDate,
          $gt: fromdate || new Date(0),
        }, 
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name",
      })
      .populate({
        path: "product.productId",
        model: "product",
      })
      .sort({ orderedData: -1 });

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
    res.status(500).send("Internal Server Error");
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
  filterSalesReport,
};
