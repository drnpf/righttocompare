const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
    },
    picture: {
      type: String, // URL to the profile picture
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId, // The Phone IDs
        ref: "Phone", // The collection name containing the phones
      },
    ],
    preferences: {
      brands: [String],
      budgetMin: { type: Number, default: 0 },
      budgetMax: { type: Number, default: 1500 },
      notifications: {
        priceAlerts: { type: Boolean, default: true },
        // If we need to add other types of notifications
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
