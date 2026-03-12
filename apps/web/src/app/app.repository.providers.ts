import { Provider } from "@angular/core";
import { AUTH_REPOSITORY } from "./domain/repositories/auth.repository";
import { BLOG_REPOSITORY } from "./domain/repositories/blog.repository";
import { CONTACT_REPOSITORY } from "./domain/repositories/contact.repository";
import { SCRAPER_REPOSITORY } from "./domain/repositories/scraper.repository";
import { LEAD_REPOSITORY } from "./domain/repositories/lead.repository";
import { CLIENT_REPOSITORY } from "./domain/repositories/client.repository";
import { PROJECT_REPOSITORY } from "./domain/repositories/project.repository";
import { ANALYTICS_REPOSITORY } from "./domain/repositories/analytics.repository";
import { CONTRACT_REPOSITORY } from "./domain/repositories/contract.repository";
import { INVOICE_REPOSITORY } from "./domain/repositories/invoice.repository";
import { TICKET_REPOSITORY } from "./domain/repositories/ticket.repository";
import { USER_REPOSITORY } from "./domain/repositories/user.repository";
import { PORTAL_REPOSITORY } from "./domain/repositories/portal.repository";
import { ApiAuthRepository } from "./infrastructure/repositories/api/api-auth.repository";
import { ApiBlogRepository } from "./infrastructure/repositories/api/api-blog.repository";
import { ApiContactRepository } from "./infrastructure/repositories/api/api-contact.repository";
import { ApiScraperRepository } from "./infrastructure/repositories/api/api-scraper.repository";
import { ApiLeadRepository } from "./infrastructure/repositories/api/api-lead.repository";
import { ApiClientRepository } from "./infrastructure/repositories/api/api-client.repository";
import { ApiProjectRepository } from "./infrastructure/repositories/api/api-project.repository";
import { ApiAnalyticsRepository } from "./infrastructure/repositories/api/api-analytics.repository";
import { ApiContractRepository } from "./infrastructure/repositories/api/api-contract.repository";
import { ApiInvoiceRepository } from "./infrastructure/repositories/api/api-invoice.repository";
import { ApiTicketRepository } from "./infrastructure/repositories/api/api-ticket.repository";
import { ApiUserRepository } from "./infrastructure/repositories/api/api-user.repository";
import { ApiPortalRepository } from "./infrastructure/repositories/api/api-portal.repository";

export const repositoryProviders: Provider[] = [
  ApiAuthRepository,
  ApiBlogRepository,
  ApiContactRepository,
  ApiScraperRepository,
  ApiLeadRepository,
  ApiClientRepository,
  ApiProjectRepository,
  ApiAnalyticsRepository,
  ApiContractRepository,
  ApiInvoiceRepository,
  ApiTicketRepository,
  ApiUserRepository,
  ApiPortalRepository,
  { provide: AUTH_REPOSITORY,      useExisting: ApiAuthRepository },
  { provide: BLOG_REPOSITORY,      useExisting: ApiBlogRepository },
  { provide: CONTACT_REPOSITORY,   useExisting: ApiContactRepository },
  { provide: SCRAPER_REPOSITORY,   useExisting: ApiScraperRepository },
  { provide: LEAD_REPOSITORY,      useExisting: ApiLeadRepository },
  { provide: CLIENT_REPOSITORY,    useExisting: ApiClientRepository },
  { provide: PROJECT_REPOSITORY,   useExisting: ApiProjectRepository },
  { provide: ANALYTICS_REPOSITORY, useExisting: ApiAnalyticsRepository },
  { provide: CONTRACT_REPOSITORY,  useExisting: ApiContractRepository },
  { provide: INVOICE_REPOSITORY,   useExisting: ApiInvoiceRepository },
  { provide: TICKET_REPOSITORY,    useExisting: ApiTicketRepository },
  { provide: USER_REPOSITORY,      useExisting: ApiUserRepository },
  { provide: PORTAL_REPOSITORY,    useExisting: ApiPortalRepository },
];
