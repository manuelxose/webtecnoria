import { InjectionToken } from "@angular/core";

export interface ScraperRepository {
  createJob(query: string): Promise<any>;
  jobStatus(id: string): Promise<any>;
  jobResult(id: string): Promise<any>;
}

export const SCRAPER_REPOSITORY = new InjectionToken<ScraperRepository>("SCRAPER_REPOSITORY");
