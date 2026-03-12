import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type SessionClaims = {
  sub: string;
  email: string;
  role: "admin" | "editor" | "viewer" | "client";
  displayName?: string | null;
  clientId?: string | null;
};

export function signSessionToken(claims: SessionClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: "8h" });
}

export function verifySessionToken(token: string): SessionClaims {
  return jwt.verify(token, env.JWT_SECRET) as SessionClaims;
}
