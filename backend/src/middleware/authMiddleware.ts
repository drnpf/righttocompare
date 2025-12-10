import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

/**
 * A custom request interface for the decoded Firebase token.
 */
export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

/**
 * Middleware which handles verifying Firebase ID token.
 * @param req AuthRequest (an extension of Express Request)
 * @param res Express Response
 * @param next The next function on route (UserController)
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Checks if header exists and starts with "Bearer" to indicate token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Parsing token from request header and verifying token
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next(); // Moves to next function in route (the controller)
    } catch (error) {
      console.error("Security Alert: Token verification failed:", error);
      res.status(401).json({ message: "Not authorized" });
    }
  } else {
    // Case for no token existing
    res.status(401).json({ message: "Not authorized" });
  }
};
