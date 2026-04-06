// backend/middleware/authMock.js

/**
 * Temporary auth stub for prototype.
 *
 * - In a real system, this would verify a JWT or Firebase token and
 *   set req.userId to the authenticated user's ID.
 * - For now:
 *   1) Look for X-Demo-User-Id header, or
 *   2) Use a fixed demo user id from env DEMO_USER_ID (optional).
 */

function authMock(req, res, next) {
  const demoId = req.header("X-Demo-User-Id") || process.env.DEMO_USER_ID;

  if (!demoId) {
    return res.status(401).json({
      message:
        "No authentication implemented yet. Set X-Demo-User-Id header or DEMO_USER_ID in .env."
    });
  }

  req.userId = demoId;
  next();
}

module.exports = authMock;