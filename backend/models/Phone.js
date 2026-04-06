// backend/models/Phone.js
const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true
    },
    modelName: {
      type: String,
      required: true,
      trim: true
    },
    os: {
      type: String,
      enum: ["Android", "iOS", "Other"],
      default: "Other"
    },
    basePrice: {
      type: Number,
      required: true
    },
    // simple flags for now
    has5g: {
      type: Boolean,
      default: false
    },
    batteryMah: {
      type: Number
    }
    // TODO: add full spec structure here (RAM, storage, display, cameras, bands, etc.)
  },
  {
    timestamps: true
  }
);

const Phone = mongoose.model("Phone", phoneSchema);

module.exports = Phone;
