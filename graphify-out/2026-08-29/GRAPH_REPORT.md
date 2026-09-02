# Graph Report - webtecnoria  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1825 nodes · 2961 edges · 135 communities (109 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44dd579e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LeadRepository
- SeoService
- site-content.ts
- ContractRepository
- analytics.repository.ts
- admin-panel.component.ts
- dependencies
- ListaBlogsComponent
- server.ts
- EditorBlogComponent
- scripts
- AuthRepository
- UsersPageComponent
- web-empresa
- api-client.repository.ts
- client.repository.ts
- compilerOptions
- rules
- AdminPanelComponent
- ContactFormComponent
- scripts
- auth.ts
- BlogPageComponent
- devDependencies
- v1/index.ts
- devDependencies
- ProjectDetailComponent
- blog.repository.ts
- service-detail-page.component.ts
- middleware.ts
- FinanceOverviewComponent
- home-page.component.ts
- dependencies
- ClientDetailComponent
- ApiInvoiceRepository
- ticket.repository.ts
- editor-blog.component.ts
- ApiProjectRepository
- ChatWidgetEmbedComponent
- dev.mjs
- pages/auctorio-page.component.ts
- ParticleCanvasComponent
- api/src/index.ts
- options
- ClientsListComponent
- TicketDetailComponent
- app.routes.ts
- tsconfig.app.json
- compilerOptions
- AdminLayoutComponent
- ApiScraperRepository
- InvoiceDetailComponent
- project.repository.ts
- ProjectsListComponent
- TicketsListComponent
- ApiAuthRepository
- SiteHeaderComponent
- compilerOptions
- auth-login.component.ts
- InvoiceFormComponent
- InvoicesListComponent
- TicketRepository
- PortalDashboardComponent
- PortalTicketsComponent
- ProjectRepository
- BlogRepository
- PortalInvoicesComponent
- PortalProjectsComponent
- ArticlePageComponent
- shared-types/package.json
- leads.ts
- options
- production
- auth-re-password.component.ts
- InvoiceRepository
- PortalRepository
- blog-page.component.ts
- integrations.ts
- architect
- ApiTicketRepository
- options
- projects.ts
- users.ts
- DashboardComponent
- ApiPortalRepository
- options
- component-selector
- shared-types/src/index.ts
- compilerOptions
- invoices.ts
- serve
- AnalyticsPageComponent
- ProjectFormComponent
- ticket-form.component.ts
- PortalLayoutComponent
- compilerOptions
- no-console
- typescript
- assets
- ClientFormComponent
- ClientRepository
- app.repository.providers.ts
- tslint.json
- options
- cloudflare-cutover.sh
- options
- portal_tokens
- @types/node
- options
- semicolon
- @angular/compiler
- @angular/core
- @angular-devkit/build-angular
- @angular/forms
- @angular/platform-browser
- @angular/router
- nodemailer.d.ts
- tslib
- environment.prod.ts
- deprecation
- import-blacklist
- no-inferrable-types
- object-literal-key-quotes
- quotemark
- typedef
- typedef-whitespace
- AccessRestrictedComponent
- chat-widget-embed.component.ts
- products/talkaris-page.component.ts
- SiteLayoutComponent

## God Nodes (most connected - your core abstractions)
1. `SeoService` - 47 edges
2. `rules` - 45 edges
3. `EditorBlogComponent` - 37 edges
4. `AuthRepository` - 32 edges
5. `AdminPanelComponent` - 28 edges
6. `ClientRepository` - 26 edges
7. `compilerOptions` - 24 edges
8. `BlogPageComponent` - 23 edges
9. `ProjectDetailComponent` - 22 edges
10. `FinanceOverviewComponent` - 19 edges

## Surprising Connections (you probably didn't know these)
- `files` --extends--> `src/polyfills.ts`  [EXTRACTED]
  apps/web/tsconfig.app.json → apps/web/angular.json
- `ApiAuthRepository` --implements--> `AuthRepository`  [EXTRACTED]
  apps/web/src/app/infrastructure/repositories/api/api-auth.repository.ts → apps/web/src/app/domain/repositories/auth.repository.ts
- `AccessRestrictedComponent` --references--> `AuthUser`  [EXTRACTED]
  apps/web/src/app/auth/access-restricted/access-restricted.component.ts → apps/web/src/app/domain/repositories/auth.repository.ts
- `AdminPanelComponent` --references--> `AuthUser`  [EXTRACTED]
  apps/web/src/app/core/admin/admin-panel/admin-panel.component.ts → apps/web/src/app/domain/repositories/auth.repository.ts
- `ApiClientRepository` --implements--> `ClientRepository`  [EXTRACTED]
  apps/web/src/app/infrastructure/repositories/api/api-client.repository.ts → apps/web/src/app/domain/repositories/client.repository.ts

## Import Cycles
- None detected.

## Communities (135 total, 26 thin omitted)

### Community 0 - "LeadRepository"
Cohesion: 0.05
Nodes (22): LeadDetailComponent, Component, Inject, LeadFormComponent, Component, Inject, LeadsPageComponent, PipelineColumn (+14 more)

### Community 1 - "SeoService"
Cohesion: 0.06
Nodes (21): AboutPageComponent, Component, ContactPageComponent, Component, FaqPageComponent, Component, NotFoundPageComponent, Component (+13 more)

### Community 2 - "site-content.ts"
Cohesion: 0.06
Nodes (48): SiteFooterComponent, Component, ArticleSection, articleVisualMap, AudienceSegment, audienceSegments, BacklogEntry, brandImages (+40 more)

### Community 3 - "ContractRepository"
Cohesion: 0.05
Nodes (19): ContractDetailComponent, Component, Inject, ContractFormComponent, Component, Inject, ContractsListComponent, Component (+11 more)

### Community 4 - "analytics.repository.ts"
Cohesion: 0.22
Nodes (7): AdvancedAnalytics, ANALYTICS_REPOSITORY, AnalyticsRepository, DashboardData, ApiAnalyticsRepository, Inject, Injectable

### Community 5 - "admin-panel.component.ts"
Cohesion: 0.12
Nodes (9): Inject, PrivateNavigationService, Inject, Injectable, AdminPostDraft, AdminPostSummary, ScraperJobItem, AuthUser (+1 more)

### Community 6 - "dependencies"
Cohesion: 0.05
Nodes (38): dependencies, bcryptjs, cookie-parser, cors, dotenv, express, google-auth-library, helmet (+30 more)

### Community 7 - "ListaBlogsComponent"
Cohesion: 0.08
Nodes (12): Inject, AuctorioLaunchService, LaunchResponse, Inject, Injectable, ListaBlogsComponent, Component, Inject (+4 more)

### Community 8 - "server.ts"
Cohesion: 0.09
Nodes (25): app(), fetchSessionUser(), getApiInternalUrl(), getPrivateHome(), getPublicRuntimeConfig(), isConnectionRefused(), isDashboardPath(), isPortalProtectedPath() (+17 more)

### Community 9 - "EditorBlogComponent"
Cohesion: 0.09
Nodes (5): EditorBlogComponent, Component, ViewChild, ArticleEntry, getArticleBySlug()

### Community 10 - "scripts"
Cohesion: 0.06
Nodes (33): author, bugs, url, description, homepage, license, name, optionalDependencies (+25 more)

### Community 11 - "AuthRepository"
Cohesion: 0.12
Nodes (8): NavItem, NavSection, AUTH_REPOSITORY, AuthRepository, USER_REPOSITORY, AuthGuard, Inject, Injectable

### Community 12 - "UsersPageComponent"
Cohesion: 0.07
Nodes (15): SettingsPageComponent, Component, Inject, Component, Inject, UsersPageComponent, AdminUser, InviteUserPayload (+7 more)

### Community 13 - "web-empresa"
Cohesion: 0.07
Nodes (24): blog_posts, contact_messages, scraper_jobs, users, access_requests, password_reset_tokens, set_updated_at(), clients (+16 more)

### Community 14 - "api-client.repository.ts"
Cohesion: 0.18
Nodes (7): Contact, CreateContactPayload, PaginatedClients, UpdateClientPayload, ApiClientRepository, Inject, Injectable

### Community 15 - "client.repository.ts"
Cohesion: 0.29
Nodes (6): TabId, Client, CLIENT_REPOSITORY, ClientStatus, ClientTier, CreateClientPayload

### Community 16 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, importHelpers (+20 more)

### Community 17 - "rules"
Cohesion: 0.07
Nodes (29): rules, array-type, arrow-return-shorthand, component-class-suffix, contextual-lifecycle, curly, directive-class-suffix, eofline (+21 more)

### Community 18 - "AdminPanelComponent"
Cohesion: 0.14
Nodes (3): AdminPanelComponent, Component, Inject

### Community 19 - "ContactFormComponent"
Cohesion: 0.15
Nodes (8): CONTACT_REPOSITORY, ContactRepository, ApiContactRepository, Inject, Injectable, ContactFormComponent, Component, Inject

### Community 20 - "scripts"
Cohesion: 0.08
Nodes (23): description, name, private, scripts, build, build:api, build:ssr:web, build:types (+15 more)

### Community 21 - "auth.ts"
Cohesion: 0.10
Nodes (16): signSessionToken(), AccessRequestSchema, DbUser, GoogleLoginSchema, LoginSchema, PasswordRecoverySchema, ResetPasswordSchema, router (+8 more)

### Community 22 - "BlogPageComponent"
Cohesion: 0.13
Nodes (3): BrandImage, BlogPageComponent, Component

### Community 23 - "devDependencies"
Cohesion: 0.10
Nodes (21): @angular/cli, @angular/compiler-cli, devDependencies, @angular/cli, @angular/compiler-cli, eslint, jasmine-core, karma (+13 more)

### Community 24 - "v1/index.ts"
Cohesion: 0.12
Nodes (18): requireAdmin(), pool, router, ClientSchema, ContactSchema, router, UpdateClientSchema, ContactSchema (+10 more)

### Community 25 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, tsx, @types/bcryptjs, @types/cookie-parser, @types/cors, @types/express, @types/jsonwebtoken, @types/morgan (+12 more)

### Community 27 - "blog.repository.ts"
Cohesion: 0.19
Nodes (9): BlogFetchOptions, BlogPostRecord, BlogSnapshotDoc, BlogSnapshotLike, BlogWriteInput, ApiBlogPost, ApiBlogRepository, Inject (+1 more)

### Community 28 - "service-detail-page.component.ts"
Cohesion: 0.15
Nodes (10): caseStudies, CaseStudyEntry, getArticlesBySlugs(), getServiceByKey(), serviceArticleLinks, ServiceEntry, CaseStudiesPageComponent, Component (+2 more)

### Community 29 - "middleware.ts"
Cohesion: 0.18
Nodes (13): hasEditorialAccess(), requireAdminOrIntegration(), SessionClaims, verifySessionToken(), env, EnvSchema, parsed, blogUploadsDir (+5 more)

### Community 30 - "FinanceOverviewComponent"
Cohesion: 0.13
Nodes (3): FinanceOverviewComponent, Component, Inject

### Community 31 - "home-page.component.ts"
Cohesion: 0.13
Nodes (11): benefitBlocks, challengeCards, featuredShowcases, generalFaqs, heroMetrics, homeProducts, testimonials, HomePageComponent (+3 more)

### Community 32 - "dependencies"
Cohesion: 0.12
Nodes (17): @angular/animations, @angular/common, @angular/platform-browser-dynamic, @angular/platform-server, @angular/ssr, dependencies, @angular/animations, @angular/common (+9 more)

### Community 34 - "ApiInvoiceRepository"
Cohesion: 0.17
Nodes (7): CreateInvoicePayload, Invoice, PaginatedInvoices, UpdateInvoicePayload, ApiInvoiceRepository, Inject, Injectable

### Community 35 - "ticket.repository.ts"
Cohesion: 0.25
Nodes (10): CreateTicketPayload, PaginatedTickets, Ticket, TICKET_REPOSITORY, TicketCategory, TicketMessage, TicketSource, TicketStats (+2 more)

### Community 36 - "editor-blog.component.ts"
Cohesion: 0.16
Nodes (11): EditorMode, PostDraft, PostPublicState, PostSource, PostSummary, BLOG_REPOSITORY, BlogStatus, articles (+3 more)

### Community 37 - "ApiProjectRepository"
Cohesion: 0.15
Nodes (7): Milestone, PaginatedProjects, Task, UpdateProjectPayload, ApiProjectRepository, Inject, Injectable

### Community 38 - "ChatWidgetEmbedComponent"
Cohesion: 0.26
Nodes (3): ChatWidgetEmbedComponent, Component, Inject

### Community 39 - "dev.mjs"
Cohesion: 0.28
Nodes (15): children, colors, ensureDevDependencies(), ensurePortFree(), getDevComposeBaseArgs(), isTcpPortReachable(), logSystem(), main() (+7 more)

### Community 40 - "pages/auctorio-page.component.ts"
Cohesion: 0.13
Nodes (10): getOwnProductBySlug(), RevealDirective, Inject, Input, AuctorioPageComponent, Component, WORKFLOW_STEPS, TalkarisPageComponent (+2 more)

### Community 41 - "ParticleCanvasComponent"
Cohesion: 0.19
Nodes (6): Particle, ParticleCanvasComponent, Component, Inject, Input, ViewChild

### Community 42 - "api/src/index.ts"
Cohesion: 0.50
Nodes (4): app, ensureDatabaseConnection(), start(), v1Router

### Community 43 - "options"
Cohesion: 0.14
Nodes (14): options, aot, browser, extractLicenses, index, namedChunks, optimization, outputPath (+6 more)

### Community 45 - "TicketDetailComponent"
Cohesion: 0.15
Nodes (3): TicketDetailComponent, Component, TicketPriority

### Community 46 - "app.routes.ts"
Cohesion: 0.30
Nodes (7): legacyRedirects, CreatePortalTicketPayload, PORTAL_REPOSITORY, PortalClient, PortalDashboard, PortalInvoice, PortalProject

### Community 47 - "tsconfig.app.json"
Cohesion: 0.15
Nodes (12): extends, files, include, server.ts, ./tsconfig.json, angularCompilerOptions, entryModule, extends (+4 more)

### Community 48 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule, rootDir, skipLibCheck (+4 more)

### Community 49 - "AdminLayoutComponent"
Cohesion: 0.19
Nodes (4): AdminLayoutComponent, Component, HostListener, Inject

### Community 50 - "ApiScraperRepository"
Cohesion: 0.29
Nodes (3): ApiScraperRepository, Inject, Injectable

### Community 51 - "InvoiceDetailComponent"
Cohesion: 0.17
Nodes (3): InvoiceDetailComponent, Component, Inject

### Community 52 - "project.repository.ts"
Cohesion: 0.27
Nodes (7): TabId, CreateProjectPayload, Project, PROJECT_REPOSITORY, ProjectHealth, ProjectStatus, ProjectType

### Community 53 - "ProjectsListComponent"
Cohesion: 0.18
Nodes (3): ProjectsListComponent, Component, Inject

### Community 55 - "ApiAuthRepository"
Cohesion: 0.14
Nodes (5): AccessRequestPayload, ApiAuthRepository, ApiAuthUser, Inject, Injectable

### Community 56 - "SiteHeaderComponent"
Cohesion: 0.26
Nodes (5): SiteHeaderComponent, Component, HostListener, Inject, ViewChild

### Community 57 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 58 - "auth-login.component.ts"
Cohesion: 0.18
Nodes (6): AuthLoginComponent, Component, ViewChild, getPublicRuntimeConfig(), PublicRuntimeConfig, Window

### Community 59 - "InvoiceFormComponent"
Cohesion: 0.21
Nodes (3): InvoiceFormComponent, Component, Inject

### Community 60 - "InvoicesListComponent"
Cohesion: 0.19
Nodes (3): InvoicesListComponent, Component, Inject

### Community 61 - "TicketRepository"
Cohesion: 0.17
Nodes (3): Inject, Inject, TicketRepository

### Community 62 - "PortalDashboardComponent"
Cohesion: 0.17
Nodes (3): PortalDashboardComponent, Component, Inject

### Community 63 - "PortalTicketsComponent"
Cohesion: 0.17
Nodes (3): PortalTicketsComponent, Component, Inject

### Community 65 - "BlogRepository"
Cohesion: 0.18
Nodes (3): BlogRepository, Inject, Inject

### Community 66 - "PortalInvoicesComponent"
Cohesion: 0.20
Nodes (3): PortalInvoicesComponent, Component, Inject

### Community 67 - "PortalProjectsComponent"
Cohesion: 0.18
Nodes (3): PortalProjectsComponent, Component, Inject

### Community 68 - "ArticlePageComponent"
Cohesion: 0.31
Nodes (3): getArticleVisualBySlug(), ArticlePageComponent, Component

### Community 69 - "shared-types/package.json"
Cohesion: 0.18
Nodes (10): files, main, name, private, scripts, build, type, types (+2 more)

### Community 70 - "leads.ts"
Cohesion: 0.22
Nodes (8): AuthedRequest, requireAuth(), LeadSchema, router, UpdateLeadSchema, PortalRequest, requirePortal(), router

### Community 71 - "options"
Cohesion: 0.20
Nodes (10): src/polyfills.ts, karmaConfig, main, polyfills, scripts, styles, tsConfig, options (+2 more)

### Community 72 - "production"
Cohesion: 0.22
Nodes (9): production, budgets, buildTarget, extractLicenses, fileReplacements, namedChunks, optimization, outputHashing (+1 more)

### Community 73 - "auth-re-password.component.ts"
Cohesion: 0.14
Nodes (8): AuthRePasswordComponent, Component, Inject, AuthSignupComponent, Component, Inject, parseApiError(), ParsedApiError

### Community 74 - "InvoiceRepository"
Cohesion: 0.17
Nodes (7): LineItem, CreateInvoiceItem, INVOICE_REPOSITORY, InvoiceItem, InvoiceRepository, InvoiceStats, InvoiceStatus

### Community 76 - "blog-page.component.ts"
Cohesion: 0.22
Nodes (8): editorialBacklog, BacklogCardView, BLOG_CLUSTER_DEFINITIONS, BLOG_CLUSTER_MAP, BlogCardView, BlogClusterDefinition, BlogClusterKey, BlogClusterView

### Community 77 - "integrations.ts"
Cohesion: 0.29
Nodes (5): buildPublicLaunchUrl(), LaunchSchema, LaunchTicketResponse, resolveAuctorioReturnTo(), router

### Community 78 - "architect"
Cohesion: 0.25
Nodes (8): build, extract-i18n, test, builder, configurations, builder, builder, architect

### Community 79 - "ApiTicketRepository"
Cohesion: 0.22
Nodes (3): ApiTicketRepository, Inject, Injectable

### Community 80 - "options"
Cohesion: 0.25
Nodes (8): whitespace, options, check-branch, check-decl, check-operator, check-separator, check-type, check-typecast

### Community 81 - "projects.ts"
Cohesion: 0.29
Nodes (5): MilestoneSchema, ProjectSchema, router, TaskSchema, UpdateProjectSchema

### Community 82 - "users.ts"
Cohesion: 0.29
Nodes (5): InviteUserRoleSchema, InviteUserSchema, router, UpdateUserSchema, UserRoleSchema

### Community 83 - "DashboardComponent"
Cohesion: 0.13
Nodes (3): DashboardComponent, Component, Inject

### Community 84 - "ApiPortalRepository"
Cohesion: 0.20
Nodes (4): PortalTicket, ApiPortalRepository, Inject, Injectable

### Community 85 - "options"
Cohesion: 0.29
Nodes (7): anonymous, asyncArrow, constructor, method, named, space-before-function-paren, options

### Community 86 - "component-selector"
Cohesion: 0.29
Nodes (7): component-selector, directive-selector, app, attribute, camelCase, element, kebab-case

### Community 87 - "shared-types/src/index.ts"
Cohesion: 0.29
Nodes (6): ApiError, AuthUser, BlogPost, ContactMessage, Paginated, ScraperJob

### Community 88 - "compilerOptions"
Cohesion: 0.33
Nodes (6): @angular/localize, @angular/localize, compilerOptions, outDir, types, node

### Community 89 - "invoices.ts"
Cohesion: 0.33
Nodes (4): InvoiceItemSchema, InvoiceSchema, router, UpdateInvoiceSchema

### Community 90 - "serve"
Cohesion: 0.33
Nodes (6): serve, options, buildTarget, builder, configurations, options

### Community 92 - "ProjectFormComponent"
Cohesion: 0.33
Nodes (3): ProjectFormComponent, Component, Inject

### Community 93 - "ticket-form.component.ts"
Cohesion: 0.29
Nodes (3): TicketFormComponent, Component, Inject

### Community 94 - "PortalLayoutComponent"
Cohesion: 0.33
Nodes (3): PortalLayoutComponent, Component, Inject

### Community 95 - "compilerOptions"
Cohesion: 0.33
Nodes (6): compilerOptions, module, outDir, target, types, node

### Community 96 - "no-console"
Cohesion: 0.33
Nodes (6): no-console, debug, info, time, timeEnd, trace

### Community 97 - "typescript"
Cohesion: 0.40
Nodes (5): typescript, typescript, typescript, devDependencies, typescript

### Community 98 - "assets"
Cohesion: 0.40
Nodes (5): assets, src/assets, src/favicon.ico, src/robots.txt, src/sitemap.xml

### Community 99 - "ClientFormComponent"
Cohesion: 0.40
Nodes (3): ClientFormComponent, Component, Inject

### Community 100 - "ClientRepository"
Cohesion: 0.17
Nodes (3): Inject, Inject, ClientRepository

### Community 101 - "app.repository.providers.ts"
Cohesion: 0.27
Nodes (4): SCRAPER_REPOSITORY, ScraperRepository, API_BASE_URL, normalizeBaseUrl()

### Community 102 - "tslint.json"
Cohesion: 0.40
Nodes (4): extends, rulesDirectory, codelyzer, tslint:recommended

### Community 103 - "options"
Cohesion: 0.40
Nodes (5): variable-name, options, allow-pascal-case, ban-keywords, check-format

### Community 104 - "cloudflare-cutover.sh"
Cohesion: 0.80
Nodes (4): cf_api(), require_env(), cloudflare-cutover.sh script, upsert_a_record()

### Community 105 - "options"
Cohesion: 0.50
Nodes (4): options, align, parameters, statements

### Community 107 - "@types/node"
Cohesion: 0.67
Nodes (3): @types/node, @types/node, @types/node

### Community 108 - "options"
Cohesion: 0.67
Nodes (3): options, indent, spaces

### Community 109 - "semicolon"
Cohesion: 0.67
Nodes (3): semicolon, options, always

### Community 131 - "AccessRestrictedComponent"
Cohesion: 0.27
Nodes (3): AccessRestrictedComponent, Component, Inject

### Community 132 - "chat-widget-embed.component.ts"
Cohesion: 0.40
Nodes (4): WidgetEnvironment, WidgetRuntimeConfig, WidgetWindow, environment

## Knowledge Gaps
- **406 isolated node(s):** `PipelineColumn`, `ParsedApiError`, `NavItem`, `NavSection`, `AdminPostDraft` (+401 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EditorBlogComponent` connect `EditorBlogComponent` to `editor-blog.component.ts`, `ListaBlogsComponent`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `AuthRepository` connect `AuthRepository` to `AccessRestrictedComponent`, `admin-panel.component.ts`, `auth-re-password.component.ts`, `UsersPageComponent`, `app.routes.ts`, `AdminLayoutComponent`, `AdminPanelComponent`, `ApiAuthRepository`, `auth-login.component.ts`, `PortalLayoutComponent`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `ChatWidgetEmbedComponent` connect `ChatWidgetEmbedComponent` to `site-content.ts`, `chat-widget-embed.component.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `PipelineColumn`, `ParsedApiError`, `NavItem` to the rest of the system?**
  _406 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `LeadRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.05009920634920635 - nodes in this community are weakly interconnected._
- **Should `SeoService` be split into smaller, more focused modules?**
  _Cohesion score 0.058001397624039136 - nodes in this community are weakly interconnected._
- **Should `site-content.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06187202538339503 - nodes in this community are weakly interconnected._