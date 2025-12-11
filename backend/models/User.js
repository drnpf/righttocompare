// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
      // NOTE: teammate can plug in bcrypt hashing later
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
    // TODO (teammate): add preferences, notification settings, etc.
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
