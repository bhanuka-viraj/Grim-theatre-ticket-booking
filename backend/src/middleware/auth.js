import { UnauthorizedError } from "../utils/errors.js";

/**
 * Simple password-based admin authentication middleware
 * In production, consider JWT tokens or session-based auth
 */
export const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Admin authentication required");
  }

  const password = authHeader.split(" ")[1];

  if (password !== process.env.ADMIN_PASSWORD) {
    throw new UnauthorizedError("Invalid admin credentials");
  }

  next();
};
