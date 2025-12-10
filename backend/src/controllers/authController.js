const authService = require("../services/authService");
/**
 * Syncs the user profile from Auth0 to MongoDB.
 * @route POST /api/auth/sync
 * @param {*} req - ExpressJS request containing auth payload
 * @param {*} res - ExpressJS response onbject
 */
const syncUser = async (req, res) => {
  // Getting user info from HTTP request
  const { sub, email, name, picture } = req.auth.payload;

  try {
    // Delegating request processing to AuthService to perform user retrieval
    const result = await authService.syncUserToDatabase({
      sub,
      email,
      name,
      picture,
    });

    // Deciding status code based on the result of authService
    if (result.isNew) {
      console.log(`New User Registered: ${result.user.email}`);
      return res.status(201).json(result.user); // 201 Created
    } else {
      console.log(`User Logged In: ${result.user.email}`);
      return res.status(200).json(result.user); // 200 OK
    }
  } catch (error) {
    console.error("Authorization Sync Error", error);
    res.status(500).json({ message: "Server Error during Auth Sync" });
  }
};

module.exports = { syncUser };
