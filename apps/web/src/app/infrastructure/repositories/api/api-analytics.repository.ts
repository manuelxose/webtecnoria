import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import {
  AdvancedAnalytics,
  AnalyticsRepository,
  DashboardData,
} from "src/app/domain/repositories/analytics.repository";
import { API_BASE_URL } from "../../http/api-base-url.token";

@Injectable()
export class ApiAnalyticsRepository implements AnalyticsRepository {
  private readonly base: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) base: string
  ) {
    this.base = base.replace(/\/$/, "");
  }

  async dashboard(): Promise<DashboardData> {
    return firstValueFrom(
      this.http.get<DashboardData>(`${this.base}/api/v1/analytics/dashboard`, {
        withCredentials: true,
      })
    );
  }

  async advanced(): Promise<AdvancedAnalytics> {
    return firstValueFrom(
      this.http.get<AdvancedAnalytics>(`${this.base}/api/v1/analytics/advanced`, {
        withCredentials: true,
      })
    );
  }
}
