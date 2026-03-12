import { InjectionToken } from "@angular/core";

export type UserRole = "admin" | "editor" | "viewer";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateUserPayload = {
  full_name?: string | null;
  role?: UserRole;
  avatar_url?: string | null;
};

export type InviteUserPayload = {
  email: string;
  full_name?: string | null;
  role?: UserRole;
};

export type InviteUserResult = AdminUser & { temp_password: string };

export interface UserRepository {
  list(): Promise<AdminUser[]>;
  get(id: string): Promise<AdminUser | null>;
  update(id: string, data: UpdateUserPayload): Promise<AdminUser>;
  delete(id: string): Promise<void>;
  invite(data: InviteUserPayload): Promise<InviteUserResult>;
}

export const USER_REPOSITORY = new InjectionToken<UserRepository>("USER_REPOSITORY");
