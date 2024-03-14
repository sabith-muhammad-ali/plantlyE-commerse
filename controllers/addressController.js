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
    console.log(userAddress);
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
    const user = await addressModel.findOne({ user: req.session.userId });
    const address = user.address.find(
      (address) => address._id.toString() === req.body.id
    );
    address.name = req.body.name;
    address.address = req.body.address;
    address.city = req.body.city;
    address.state = req.body.state;
    address.postcode = req.body.postcode;
    address.mobile = req.body.mobile;

    await user.save();
    res.redirect("/user-profile");
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  loadAddAddress,
  addAddress,
  loadAddresses,
  editAddress,
};
