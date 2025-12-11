// backend/routes/profileRoutes.js
const express = require("express");
const authMock = require("../middleware/authMock");
const {
  getMyProfile,
  updateMyProfile
} = require("../controllers/profileController");

const router = express.Router();

// All profile routes require "auth"
router.get("/me", authMock, getMyProfile);
router.put("/me", authMock, updateMyProfile);

module.exports = router;