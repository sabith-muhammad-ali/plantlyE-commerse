const addressModel = require("../models/addressModel");

const loadAddAddress = async (req, res) => {
  try {
    const address = await addressModel.find({ user: req.session.userId });
    res.render("user/add-address", { address });
  } catch (error) {
    console.log(error);
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, address, state, city, postcode, mobile } = req.body;
    const Address = {
      name: name,
      address: address,
      state: state,
      city: city,
      postcode: postcode,
      mobile: mobile,
    };
    const userAddress = await addressModel.findOneAndUpdate(
      { user: req.session.userId },
      { $push: { address: Address } },
      { upsert: true, new: true }
    );
    res.redirect("/user-profile");
  } catch (error) {
    console.log(error);
  }
};

const loadAddresses = async (req, res) => {
  try {
    const address = await addressModel.find({ user: req.session.userId });
    res.render("user/addresses", { address });
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const useraddresID = req.body.id;
    const { name, address, city, state, postcode, mobile } = req.body;
    const userid = req.session.userId;
    const updateUser = await addressModel.findOneAndUpdate(
      { user: userid, "address._id": useraddresID },
      {
        $set: {
          "address.$.name": name,
          "address.$.address": address,
          "address.$.state": state,
          "address.$.city": city,
          "address.$.postcode": postcode,
          "address.$.mobile": mobile,
        },
      },
      { new: true }
    );
    if (updateUser) {
      res.redirect("/user-profile");
    } else {
      res.status(400).json("failed to update address");
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.body.id;
    const deleted = await addressModel.updateOne(
      { user: req.session.userId },
      { $pull: { address: { _id: id } } },
      { new: true }
    );
    if (deleted) {
      res.status(200).json({ message: "user address has been deleted!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while deleting the address");
  }
};

module.exports = {
  loadAddAddress,
  addAddress,
  loadAddresses,
  editAddress,
  deleteAddress,
};
