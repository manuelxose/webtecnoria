import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  UserRepository,
  AdminUser,
  UpdateUserPayload,
  InviteUserPayload,
  InviteUserResult,
} from "src/app/domain/repositories/user.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiUserRepository implements UserRepository {
  private readonly base: string;

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) base: string) {
    this.base = base.replace(/\/$/, "");
  }

  async list(): Promise<AdminUser[]> {
    return firstValueFrom(this.http.get<AdminUser[]>(`${this.base}/api/v1/users`));
  }

  async get(id: string): Promise<AdminUser | null> {
    return firstValueFrom(this.http.get<AdminUser>(`${this.base}/api/v1/users/${id}`));
  }

  async update(id: string, data: UpdateUserPayload): Promise<AdminUser> {
    return firstValueFrom(this.http.put<AdminUser>(`${this.base}/api/v1/users/${id}`, data));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/api/v1/users/${id}`));
  }

  async invite(data: InviteUserPayload): Promise<InviteUserResult> {
    return firstValueFrom(this.http.post<InviteUserResult>(`${this.base}/api/v1/users/invite`, data));
  }
}
