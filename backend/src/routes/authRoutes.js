const express = require("express");
const router = express.Router();
const { syncUser } = require("../controllers/authController");
const checkJwt = require("../middleware/checkJwt");

// Route: POST /api/auth/sync
// Flow: Request -> checkJwt -> syncUser
router.post("/sync", checkJwt, syncUser);

module.exports = router;
