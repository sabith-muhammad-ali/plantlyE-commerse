const bannerModel = require("../models/bannerModel");
const fs = require("fs");

const loadBanner = async (req, res) => {
  try {
    const banner = await bannerModel.find({});
    res.render("banner", { banner });
  } catch (error) {
    console.log(error);
  }
};

const loadAddBanner = async (req, res) => {
  try {
    res.render("add-banner");
  } catch (error) {}
};

const addBanner = async (req, res) => {
  try {
    const { name, description, link } = req.body;
    const images = req.files.map((file) => file.filename);
    const newBanner = new bannerModel ({
        name,
        description,
        link,
        images
    })
    await newBanner.save();
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
};
