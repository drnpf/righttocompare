const { auth } = require("express-oauth2-jwt-bearer");

// Verifies incoming request has a valid Auth0 token through 3 criteria:
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE, // Is it for our Auth0 API?
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL, // Is it from our Auth0 domain?
  tokenSigningAlg: "RS256", // Integrity check with digital sig.
});

module.exports = checkJwt;
