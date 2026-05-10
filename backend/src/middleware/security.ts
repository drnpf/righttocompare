import { Request, Response, NextFunction } from "express";
import sanitize from "mongo-sanitize";

/**
 * Middleware which handles sanitizing request body of NoSQL
 * $operator to prevent injection attacks.
 * @param req Express Request
 * @param res Express Response
 * @param next The next function on route
 */
export const noSqlSanitizer = (req: Request, res: Response, next: NextFunction) => {
  // Only sanitizing request body
  if (req.body) req.body = sanitize(req.body);
  next();
};
