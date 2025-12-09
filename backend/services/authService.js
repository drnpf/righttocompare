const User = require("../models/User");

/**
 * The logic for syncing a user.
 * @param {Object} userData - Extracted user info (sub, email, name, picture)
 * @returns {Object} - The saved User document
 */
const syncUserToDatabase = async ({ sub, email, name, picture }) => {
  // Checking if user exists
  let user = await User.findOne({ auth0Id: sub });

  // --- LOGIN ---
  // Update the user's metadata
  if (user) {
  }

  // --- REGISTRATION ---
  // Creating new user
  user = new User({
    auth0Id: sub,
    email: email,
    displayName: name,
    picture: picture,
    role: "user",
  });
  await user.save();
  return { user, isNew: true };
};

module.exports = { syncUserToDatabase };
