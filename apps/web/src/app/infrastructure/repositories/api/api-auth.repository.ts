import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  AuthRepository,
  AuthUser,
} from "src/app/domain/repositories/auth.repository";
import { environment } from "src/environments/environment";

type ApiAuthUser = {
  id: string;
  email: string | null;
  role?: "admin" | "editor" | "viewer";
};

@Injectable()
export class ApiAuthRepository implements AuthRepository {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, "");

  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true }
      )
    );
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      )
    );
  }

  async me(): Promise<AuthUser | null> {
    try {
      const user = await firstValueFrom(
        this.http.get<ApiAuthUser>(`${this.baseUrl}/api/v1/auth/me`, {
          withCredentials: true,
        })
      );

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch {
      return null;
    }
  }

  async refresh(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/refresh`, {}, { withCredentials: true })
    );
  }
}
