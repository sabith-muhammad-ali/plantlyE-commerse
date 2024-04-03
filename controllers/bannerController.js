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
  } catch (error) {
    console.log(error);
  }
};

const addBanner = async (req, res) => {
  try {
    const { name, description, link } = req.body;
    console.log("req.body:", req.body);


    const images = req.files.map((file) => file.filename);

    const newBanner = new bannerModel({
      name,
      description,
      link,
      image: images,
      is_listed:true
    });

    await newBanner.save();
    res.redirect("/admin/banner");
    console.log(addBanner);
  } catch (error) {
    console.log(error)
  }
};

const loadEditBanner = async (req,res) => {
  try {
    const bannerId = req.query.id;
    console.log(bannerId)
    const bannerData = await bannerModel.findById(bannerId); 
    console.log(bannerData)
    res.render("edit-banner",{bannerData})
  } catch (error) {
    console.log(error);
  }
}

const editBanner = async (req,res) => {
  try {
    const bannerId = req.body.bannerId
    const { name, description, link } = req.body;
    const images = req.files.map((file) => file.filename);

    const updateBanner = await bannerModel.findById(bannerId);
    
    updateBanner.image = []//remove exisisting image
    updateBanner.image = images;// add new image

    updateBanner.name = name;
    updateBanner.description = description;
    updateBanner.link = link 

    const updatedBanner  = await updateBanner.save();

    if(updatedBanner){
      res.redirect("/admin/banner")
    }

  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
  loadEditBanner,
  editBanner
};
