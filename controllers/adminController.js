const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

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
    const filterData = req.query.filter;
    console.log(req.query.filter, "  fltrdtttaaa");
    console.log("filterData:", filterData);

    const orderData = await orderModel.find({});
    const productData = await productModel.find({});
    const categoryData = await categoryModel.find({});

    let totalSalesAmount = 0;

    orderData.forEach((order) => {
      order.product.forEach((item) => {
        if (item.productStatus === "Delivered") {
          totalSalesAmount += item.price * item.quantity;
        }
      });
    });

    let labels;
    let graphValue;

    if (filterData === "yearly") {
      console.log("ethiiii");
      const currentYear = new Date().getFullYear();

      const years = [
        currentYear - 4,
        currentYear - 3,
        currentYear - 2,
        currentYear - 1,
        currentYear,
      ];
      labels = years;

      const annualIncome = [];

      for (const year of years) {
        const beginningOfYear = new Date(year, 0, 1);
        const yearClosure = new Date(year + 1, 0, 1);
        yearClosure.setMilliseconds(yearClosure.getMilliseconds() - 1);

        const annualSales = await orderModel.aggregate([
          {
            $unwind: "$product"
          },
          {
            $match: {
              "product.productStatus": "Delivered",
              "orderedData": {
                $gte: beginningOfYear,
                $lt: yearClosure,
              },
            },
          },
          {
            $group: {
              _id: { $year: "$orderedData" },
              annualSales: { $sum: "$Total" },
            },
          },
        ]);
        annualIncome.push({ year, annualSales });
        console.log(annualIncome, "incccmmmm");
      }
      graphValue = Array(5).fill(0);
      annualIncome.forEach((yearData, index) => {
        graphValue[index] =
          yearData.annualSales.length > 0
            ? yearData.annualSales[0].annualSales
            : 0;
      });

      console.log("graphValue", graphValue);
    } else {
      labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      const currentMonth = new Date();

      const startOfCalendarMonth = new Date(currentMonth.getFullYear(), 0, 1);
      const endOfCalendarMonth = new Date(currentMonth.getFullYear() + 1, 0, 1);
      endOfCalendarMonth.setMilliseconds(
        endOfCalendarMonth.getMilliseconds() - 1
      );

      const revenuePerMonth = await orderModel.aggregate([
        {
          $unwind: "$product"
        },
        {
          $match: {
            "product.productStatus": "Delivered",
            "orderedData": {
              $gte: startOfCalendarMonth,
              $lt: endOfCalendarMonth,
            },
          },
        },
        {
          $group: {
            _id: { $month: "$orderedData" },
            revenuePerMonth: { $sum: "$Total" },
          },
        },
      ]);

      graphValue = Array(12).fill(0);

      revenuePerMonth.forEach((entry) => {
        const monthIndex = entry._id - 1;
        graphValue[monthIndex] = entry.revenuePerMonth;
      });
    }

    const cod = await orderModel.countDocuments({
      paymentMethod: "cash On Delivery",
      "product.productStatus": "Delivered",
    });
    const wallet = await orderModel.countDocuments({
      paymentMethod: "wallet",
      "product.productStatus": "Delivered",
    });
    const razorPay = await orderModel.countDocuments({
      paymentMethod: "razorPay",
      "product.productStatus": "Delivered",
    });

    const topPerformingProducts = await orderModel.aggregate([
      { $unwind: "$product" },
      {
        $match: {
          "product.productStatus": "Delivered",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "joinedProduct",
        },
      },
      { $unwind: "$joinedProduct" },
      {
        $group: {
          _id: "$joinedProduct._id",
          productName: { $first: "$joinedProduct.name" },
          totalSold: { $sum: "$product.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
    ]);
    const topProductLables = topPerformingProducts.map(
      (product) => product.productName
    );
    const topProductCounts = topPerformingProducts.map(
      (product) => product.totalSold
    );

    const topPerformingCategories = await orderModel.aggregate([
      { $unwind: "$product" },
      {
        $match: {
          "product.productStatus": "Delivered",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "joinedProduct",
        },
      },
      { $unwind: "$joinedProduct" },
      {
        $lookup: {
          from: "categories",
          localField: "joinedProduct.categoryId",
          foreignField: "_id",
          as: "joinedCategory",
        },
      },
      { $unwind: "$joinedCategory" },
      {
        $group: {
          _id: "$joinedCategory._id",
          categoryName: { $first: "$joinedCategory.name" },
          totalSold: { $sum: "$product.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
    ]);

    const topCategoryLabels = topPerformingCategories.map(
      (category) => category.categoryName
    );
    const topCategoryCount = topPerformingCategories.map(
      (category) => category.totalSold
    );

    res.render("adminDashbord", {
      orderData,
      productData,
      categoryData,
      totalSalesAmount,
      topPerformingProducts,
      labels,
      graphValue,
      cod,
      wallet,
      razorPay,
      topProductLables,
      topProductCounts,
      topCategoryLabels,
      topCategoryCount,
      topPerformingCategories,
      filterData: filterData
    });
  } catch (error) {
    console.log(error.message);
  }
}
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
