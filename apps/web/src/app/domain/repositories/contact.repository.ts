import { InjectionToken } from "@angular/core";

export interface ContactRepository {
  submitLead(data: Record<string, unknown>): Promise<void>;
}

export const CONTACT_REPOSITORY = new InjectionToken<ContactRepository>("CONTACT_REPOSITORY");
