const Phone = require("../models/Phone");
const mongoose = require("mongoose");

// Gets all phones
async function getAllPhones(req, res) {
  try {
    const phones = await Phone.find();
    res.json(phones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Gets a single phone by ID
async function getPhoneById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid phone ID" });
    }

    const phone = await Phone.findById(req.params.id);

    if (!phone) {
        return res.status(404).json({ message: "Phone not found" });
    }

    res.json(phone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Creates new phone
async function createPhone(req, res) {
  try {
    const { brand, modelName, basePrice } = req.body;

    if (!brand || !modelName || !basePrice) {
      return res.status(400).json({ message: "Please include brand, model name, and base price" });
    }

    const phone = new Phone(req.body);
    await phone.save();
    res.status(201).json(phone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Updates phone
async function updatePhone(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid phone ID" });
    }

    const phone = await Phone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!phone) {
        return res.status(404).json({ message: "Phone not found" });
    }

    res.json(phone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Deletes phone
async function deletePhone(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid phone ID" });
    }

    const phone = await Phone.findByIdAndDelete(req.params.id);
    if (!phone) {
         return res.status(404).json({ message: "Phone not found" });
    }

    res.json({ message: "Phone deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAllPhones, getPhoneById, createPhone, updatePhone, deletePhone };