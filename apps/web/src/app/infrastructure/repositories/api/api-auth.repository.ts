import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  AccessRequestPayload,
  AuthRepository,
  AuthUser,
} from "src/app/domain/repositories/auth.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

type ApiAuthUser = {
  id: string;
  email: string | null;
  displayName?: string | null;
  role: "admin" | "editor" | "viewer";
};

@Injectable()
export class ApiAuthRepository implements AuthRepository {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true }
      )
    );
  }

  async loginWithGoogle(credential: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/v1/auth/google`,
        { credential },
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
        displayName: user.displayName,
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

  async requestAccess(payload: AccessRequestPayload): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/access-request`, payload)
    );
  }

  async requestPasswordRecovery(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/password-recovery`, { email })
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/auth/reset-password`, {
        token,
        password,
      })
    );
  }
}
