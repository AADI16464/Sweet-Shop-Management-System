import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔒 Strongly typed JWT secret (TS-safe)
 */
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
})();

/**
 * Expected JWT payload structure
 */
interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Authenticate JWT token
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      !("id" in decoded) ||
      !("email" in decoded) ||
      !("isAdmin" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const payload = decoded as AuthPayload;

    (req as any).user = {
      id: payload.id,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Require admin access
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!user.isAdmin) {
    return res.status(403).json({ error: "Admin privileges required" });
  }

  next();
}
