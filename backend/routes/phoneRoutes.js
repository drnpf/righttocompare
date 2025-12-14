// backend/routes/phoneRoutes.js
const express = require("express");
const {
  getAllPhones,
  getPhoneById,
  createPhone,
  updatePhone,
  deletePhone
} = require("../controllers/phoneController");

const router = express.Router();

router.get("/", getAllPhones);
router.get("/:id", getPhoneById);
router.post("/", createPhone);
router.put("/:id", updatePhone);
router.delete("/:id", deletePhone);

module.exports = router;