import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { verifySessionToken } from "./tokens.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: "admin" | "editor" | "viewer";
  };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing session" });
    return;
  }

  try {
    const claims = verifySessionToken(token);
    req.user = {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
    };
    next();
  } catch {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Invalid session" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "editor")) {
      res.status(403).json({ code: "FORBIDDEN", message: "Insufficient role" });
      return;
    }
    next();
  });
}
