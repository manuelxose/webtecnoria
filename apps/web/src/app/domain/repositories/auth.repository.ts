import { InjectionToken } from "@angular/core";

export type AuthUser = {
  id: string;
  email: string | null;
  displayName?: string | null;
  role: "admin" | "editor" | "viewer";
};

export type AccessRequestPayload = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  message?: string;
};

export interface AuthRepository {
  login(email: string, password: string): Promise<void>;
  loginWithGoogle(credential: string): Promise<void>;
  logout(): Promise<void>;
  me(): Promise<AuthUser | null>;
  refresh(): Promise<void>;
  requestAccess(payload: AccessRequestPayload): Promise<void>;
  requestPasswordRecovery(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>("AUTH_REPOSITORY");
