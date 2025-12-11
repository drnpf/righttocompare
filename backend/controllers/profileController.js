// backend/controllers/profileController.js
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * GET /api/profile/me
 * Return the current user's profile (minus password).
 */
async function getMyProfile(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(400).json({ message: "Invalid user id (auth stub)" });
    }

    const user = await User.findById(req.userId).select(
      "email displayName role createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * PUT /api/profile/me
 * Allow updating displayName and (optionally) password.
 * Password is stored as plain text for now – teammate can replace with hashing.
 */
async function updateMyProfile(req, res) {
  try {
    const { displayName, password } = req.body;

    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(400).json({ message: "Invalid user id (auth stub)" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (displayName && displayName.trim().length > 0) {
      user.displayName = displayName.trim();
    }

    if (password && password.length >= 6) {
      // TODO (teammate): hash password with bcrypt before saving
      user.passwordHash = password;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile
};