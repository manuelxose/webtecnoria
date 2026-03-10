import { InjectionToken } from "@angular/core";

export type AuthUser = {
  id: string;
  email: string | null;
  displayName?: string | null;
  role?: "admin" | "editor" | "viewer";
};

export interface AuthRepository {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  me(): Promise<AuthUser | null>;
  refresh(): Promise<void>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>("AUTH_REPOSITORY");
