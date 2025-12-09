const User = require("../models/User");
/**
 * Syncs the user profile from Auth0 to MongoDB. Handles both
 * REGISTRATION (new user) and LOGIN (existing user).
 * @route POST /api/auth/sync
 * @param {*} req - ExpressJS request containing auth payload
 * @param {*} res - ExpressJS response onbject
 */
const syncUser = async (req, res) => {
  // Getting user info from validated Auth0 token
  const { sub, email, name, picture } = req.auth.payload;

  try {
    // Attempting to find user in DB
    let user = await User.findOne({ auth0Id: sub });

    // --- LOGIN SECTION ---
    // User EXISTS: Updating current user metadata
    if (user) {
    }

    // --- REGISTRATION SECTION ---
    // User DOES NOT EXIST: Creating new user
    user = new User({
      auth0Id: sub,
      email: email,
      displayName: name,
      picture: picture,
      role: "user",
      wishlist: [],
      preferences: {
        notifications: {
          priceAlerts: true,
        },
      },
    });
    await user.save();
    console.log("New User Registered: ${user.email}");
    return res.status(201).json(user);
  } catch (error) {
    console.error("Authorization Sync Error", error);
    res.status(500).json({ message: "Server Error during Auth Sync" });
  }
};

module.exports = { syncUser };
