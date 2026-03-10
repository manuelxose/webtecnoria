import { Provider } from "@angular/core";
import { AUTH_REPOSITORY } from "./domain/repositories/auth.repository";
import { BLOG_REPOSITORY } from "./domain/repositories/blog.repository";
import { CONTACT_REPOSITORY } from "./domain/repositories/contact.repository";
import { SCRAPER_REPOSITORY } from "./domain/repositories/scraper.repository";
import { ApiAuthRepository } from "./infrastructure/repositories/api/api-auth.repository";
import { ApiBlogRepository } from "./infrastructure/repositories/api/api-blog.repository";
import { ApiContactRepository } from "./infrastructure/repositories/api/api-contact.repository";
import { ApiScraperRepository } from "./infrastructure/repositories/api/api-scraper.repository";

export const repositoryProviders: Provider[] = [
  ApiAuthRepository,
  ApiBlogRepository,
  ApiContactRepository,
  ApiScraperRepository,
  {
    provide: AUTH_REPOSITORY,
    useExisting: ApiAuthRepository,
  },
  {
    provide: BLOG_REPOSITORY,
    useExisting: ApiBlogRepository,
  },
  {
    provide: CONTACT_REPOSITORY,
    useExisting: ApiContactRepository,
  },
  {
    provide: SCRAPER_REPOSITORY,
    useExisting: ApiScraperRepository,
  },
];
