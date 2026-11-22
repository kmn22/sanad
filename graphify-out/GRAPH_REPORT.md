# Graph Report - sanad  (2026-11-22)

## Corpus Check
- 456 files · ~208,483 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, . 2, .example 1)

## Summary
- 2401 nodes · 7823 edges · 131 communities (99 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f42d182a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getAuthContext
- notFoundJson
- usePortalView
- use-security-settings.ts
- index.tsx
- ClientsView.tsx
- rateLimit
- register/route.ts
- core/types.ts
- CoursesPanel
- dependencies
- cn
- environment
- use-toast.ts
- package.json
- entitlements.ts
- prisma-tenant-extension.ts
- split-module.mjs
- onboarding/page.tsx
- index.ts
- workspace.ts
- utils.ts
- next
- re
- [token]/route.ts
- useLang
- FirmTeamPage.tsx
- LandingHeader
- events.ts
- react
- immutable-audit-log.ts
- app/workflow/page.tsx
- سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل
- sheet.tsx
- codeql.yml
- use-admin.ts
- vault-envelope-encryption.ts
- PortalShell.tsx
- use-deep-work.ts
- jobs.ts
- compilerOptions
- verify/route.ts
- lucide-react
- pagination.tsx
- framer-motion
- components.json
- devDependencies
- scripts
- LawyerSectionView.tsx
- @playwright/test
- env
- register/route.ts
- robots.ts
- sitemap.ts
- checkout/route.ts
- cn
- app
- env
- menubar.tsx
- register/page.tsx
- portal-actions.tsx
- zod
- app/layout.tsx
- 🇬🇧 English Summary
- reminders.ts
- flows.spec.ts
- workflow/route.ts
- carousel.tsx
- updates
- date-fns@^4.1.0
- chart.tsx
- with
- manifest.json
- form.tsx
- next-auth
- db
- ts-sanad
- portal-links/route.ts
- toast.tsx
- drawer.tsx
- env-audit.ts
- navigation-menu.tsx
- validate
- ComplianceView.tsx
- PortalShell.tsx
- index.tsx
- compliance.ts
- healthcheck
- options
- postgres
- maqar-tenant-prisma-extension.test.ts
- edge-rate-limiter.ts
- uptime-kuma
- verify-email/route.ts
- dev.sh
- tailwindcss
- overrides
- services
- on
- @dnd-kit/sortable@^10.0.0
- @dnd-kit/utilities@^3.2.2
- client-portal-unified-view.tsx
- e2e
- embla-carousel-react
- @radix-ui/react-aspect-ratio
- @radix-ui/react-accordion
- maqar-smoke-test.sh
- build.sh
- start.sh
- docker-entrypoint.sh
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-separator
- @radix-ui/react-switch
- react-day-picker
- @hookform/resolvers@^5.1.1
- @reactuses/core@^6.0.5
- uuid@^11.1.0
- vaul
- codemod-sanad-to-maqar.mts
- prune-imports.mjs
- postcss.config.mjs
- sw.js
- مَقَرّ (Maqar)
- seed_clients.ts
- uqr

## God Nodes (most connected - your core abstractions)
1. `cn()` - 232 edges
2. `getAuthContext()` - 190 edges
3. `unauthorizedJson()` - 181 edges
4. `Button()` - 168 edges
5. `next` - 145 edges
6. `lucide-react` - 121 edges
7. `react` - 106 edges
8. `useLang()` - 93 edges
9. `db` - 85 edges
10. `notFoundJson()` - 83 edges

## Surprising Connections (you probably didn't know these)
- `Security model (summary)` --references--> `client()`  [INFERRED]
  README.md → src/lib/email.ts
- `Background jobs` --references--> `ensureRecurringJobs()`  [INFERRED]
  README.md → src/lib/jobs.ts
- `createWorkspace()` --calls--> `hashPassword()`  [EXTRACTED]
  tests/workspace-isolation.test.ts → src/lib/auth/password.ts
- `main()` --calls--> `hashPassword()`  [EXTRACTED]
  scripts/seed_e2e.ts → src/lib/auth/password.ts
- `seedMaqarMultiTenantPlatform()` --calls--> `hashPassword()`  [EXTRACTED]
  prisma/seed.ts → src/lib/auth/password.ts

## Import Cycles
- None detected.

## Communities (131 total, 32 thin omitted)

### Community 0 - "getAuthContext"
Cohesion: 0.09
Nodes (60): GET(), GET(), PUT(), targetWorkspace(), GET(), GET(), ACTIONS, PATCH() (+52 more)

### Community 1 - "notFoundJson"
Cohesion: 0.16
Nodes (46): DECISIONS, PATCH(), POST(), GET(), DELETE(), PATCH(), POST(), DELETE() (+38 more)

### Community 2 - "usePortalView"
Cohesion: 0.22
Nodes (4): usePortalView(), handleConfirmPayment(), handleSendChatMessage(), handleVerifyOtp()

### Community 3 - "use-security-settings.ts"
Cohesion: 0.16
Nodes (12): ChangePasswordSection(), DataPrivacySection(), MfaSection(), NotificationPreferencesSection(), SecurityHeader(), SecuritySettingsState, useSecuritySettings(), defaultPrefs() (+4 more)

### Community 4 - "index.tsx"
Cohesion: 0.25
Nodes (18): InvoicePreviewDialog(), InvoiceRow(), STATUS_COLORS, STATUS_FILTERS, StatTile(), InvoicesView(), Table(), TableBody() (+10 more)

### Community 5 - "ClientsView.tsx"
Cohesion: 0.11
Nodes (64): sonner, AddCaseDialog(), CLIENT_TYPES, ClientFormDialog(), ClientsView(), FormState, CommandAction, CommandPalette() (+56 more)

### Community 6 - "rateLimit"
Cohesion: 0.14
Nodes (20): otplib, POST(), POST(), POST(), POST(), execPromise, POST(), GET() (+12 more)

### Community 7 - "register/route.ts"
Cohesion: 0.16
Nodes (26): POST(), ACCOUNT_TYPES, AccountType, getClientIp(), POST(), recordPrivacyAcceptance(), Tx, hashToken() (+18 more)

### Community 8 - "core/types.ts"
Cohesion: 0.05
Nodes (61): @dnd-kit/core, OverviewTab(), InfoRow(), StatCard(), TimeTabProps, CaseDetail, CASE_TYPES, PRIORITIES (+53 more)

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (53): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @dnd-kit/core@^6.3.1, docx@^9.7.1, emailjs@^5.0.3, lucide-react@^0.525.0 (+45 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (32): SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction(), SidebarGroupContent(), SidebarGroupLabel() (+24 more)

### Community 12 - "environment"
Cohesion: 0.04
Nodes (48): cap_drop, container_name, depends_on, environment, extra_hosts, healthcheck, image, ports (+40 more)

### Community 13 - "use-toast.ts"
Cohesion: 0.17
Nodes (15): ToastActionElement, ToastProps, Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId() (+7 more)

### Community 14 - "package.json"
Cohesion: 0.05
Nodes (43): file-saver@^2.0.5, input-otp@^1.4.2, prisma@^6.11.1, @radix-ui/react-alert-dialog@^1.1.14, @radix-ui/react-avatar@^1.1.10, @radix-ui/react-context-menu@^2.2.15, @radix-ui/react-dialog@^1.1.14, @radix-ui/react-hover-card@^1.1.14 (+35 more)

### Community 15 - "entitlements.ts"
Cohesion: 0.09
Nodes (30): vitest, GET(), filterTaskStats(), TaskLike, runRetentionSweep(), SOFT_DELETABLE, ACTIVE_SUBSCRIPTION_STATUSES, betaAiDailyLimit() (+22 more)

### Community 16 - "prisma-tenant-extension.ts"
Cohesion: 0.13
Nodes (18): assertNoCrossTenantMutationFields(), assertValidScopeContext(), assertWorkspacePresent(), buildTenantFilter(), BULK_WRITE_OPS, createAsyncContextTenantPrisma(), createTenantIsolationExtension(), createTenantScopedPrisma() (+10 more)

### Community 17 - "split-module.mjs"
Cohesion: 0.09
Nodes (18): cfg, importTexts, mainHeader, mainParts, mainReexports, outputs, reexports, require (+10 more)

### Community 18 - "onboarding/page.tsx"
Cohesion: 0.43
Nodes (6): FirmOnboardingPage(), complete(), inviteMember(), mutate(), saveIdentity(), steps

### Community 19 - "index.ts"
Cohesion: 0.07
Nodes (29): POST(), createCaseEntrySchema, createCaseSchema, createClientSchema, createComplianceSchema, createCourseSchema, createDeadlineSchema, createDocumentSchema (+21 more)

### Community 20 - "workspace.ts"
Cohesion: 0.13
Nodes (25): emptyDashboard(), getLawyerDashboard(), legalWorkspace(), ACTIVE_STAGES_EXCLUDED, FirmCaseRow, FirmMember, getFirmDashboard(), GET() (+17 more)

### Community 21 - "utils.ts"
Cohesion: 0.10
Nodes (15): class-variance-authority, Alert(), AlertDescription(), AlertTitle(), alertVariants, HoverCardContent(), ResizableHandle(), ResizablePanelGroup() (+7 more)

### Community 22 - "next"
Cohesion: 0.07
Nodes (52): nextConfig, next, PATCH(), patchSchema, ANALYSIS_TYPES, buildFallbackAnalysis(), POST(), StructuredAnalysis (+44 more)

### Community 23 - "re"
Cohesion: 0.15
Nodes (13): build_imports(), import_symbols(), main(), parse(), rewrite_mod(), used(), dedent(), imports_for() (+5 more)

### Community 24 - "[token]/route.ts"
Cohesion: 0.08
Nodes (45): POST(), GET(), runtime, GET(), runtime, GET(), runtime, GET() (+37 more)

### Community 25 - "useLang"
Cohesion: 0.08
Nodes (67): ClientDashboard(), ActivationScreen(), DocumentsTab(), HomeTab(), InvoicesTab(), SessionsTab(), SettingsTab(), CalendarEvent (+59 more)

### Community 26 - "FirmTeamPage.tsx"
Cohesion: 0.16
Nodes (18): FirmAssignments(), FirmAssignmentsPage(), FirmOverviewPage(), FirmSettingsPage(), FirmTeamPage(), INVITE_ROLES, FirmLoading(), Panel() (+10 more)

### Community 27 - "LandingHeader"
Cohesion: 0.14
Nodes (20): AboutPage(), metadata, AiDisclosurePage(), metadata, LandingFooter(), LandingHeader(), NAV_ITEMS, BillingCycle (+12 more)

### Community 28 - "events.ts"
Cohesion: 0.10
Nodes (27): POST(), VALID_FOCUS, summarize(), buildDeterministicContractSummary(), ClauseTag, ContractSummaryResult, ExtractionFocus, SAMPLE_SUPPLY_CONTRACT_SUMMARY (+19 more)

### Community 29 - "react"
Cohesion: 0.11
Nodes (22): next-auth, react, @tanstack/react-query, FirmDashboard, FirmPortalFrame(), FirmLayout(), metadata, CommandPalette (+14 more)

### Community 30 - "immutable-audit-log.ts"
Cohesion: 0.18
Nodes (13): @prisma/client, MaqarRlsContext, withTenantRls(), buildChainedAuditRecord(), ChainedAuditEnvelope, computeAuditChainHash(), GENESIS_AUDIT_CHAIN_HASH, getAuditHmacKey() (+5 more)

### Community 31 - "app/workflow/page.tsx"
Cohesion: 0.09
Nodes (16): FirmWorkflowPage(), LawyerWorkflowPage(), Approval, Assignment, Client, EmptyState(), Member, PortalRequest (+8 more)

### Community 32 - "سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل"
Cohesion: 0.09
Nodes (21): Product Roadmap & Client Portal UX Specification, الشاشة الأولى: شاشة التحقق الآمن (Secure Entry & OTP Verification), الشاشة الثالثة: مسار الخط الزمني القضائي (Visual Case Journey), الشاشة الثانية: اللوحة الرئيسية للموكل (Client Mobile-First Dashboard), الشاشة الخامسة: مراجعة المستندات والتوقيع الإلكتروني (E-Signature & Approval), الشاشة الرابعة: الفواتير والسداد الإلكتروني (ZATCA Invoices & Instant Checkout), 📌 المرحلة الأولى: تعزيز التحويل وتأمين قيمة المحامي الأساسية (Sprint 1 - 2), 📌 المرحلة الثالثة: مسارات الطلاب والتدريب المهني (Sprint 5 - 6) (+13 more)

### Community 33 - "sheet.tsx"
Cohesion: 0.29
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle(), Sidebar()

### Community 34 - "codeql.yml"
Cohesion: 0.10
Nodes (20): runs-on, steps, timeout-minutes, jobs, analyze, name, on, pull_request (+12 more)

### Community 35 - "use-admin.ts"
Cohesion: 0.19
Nodes (11): AdminHeader(), AdminNotice(), AdminStatusSection(), Card(), Status, AdminState, useAdmin(), updatePrivacyRequest() (+3 more)

### Community 36 - "vault-envelope-encryption.ts"
Cohesion: 0.36
Nodes (8): buildCanonicalAad(), decryptLegalVaultPayload(), deriveTenantKek(), EncryptedVaultEnvelope, encryptLegalVaultPayload(), getMasterKmsSecret(), LegalDataClassification, VaultEncryptionContext

### Community 37 - "PortalShell.tsx"
Cohesion: 0.13
Nodes (18): sections, AppNotification, formatRelativeTime(), getNotificationIcon(), NotificationCenter(), NavBadge, NavItem, NavSection (+10 more)

### Community 38 - "use-deep-work.ts"
Cohesion: 0.18
Nodes (16): DeepWorkHeader(), DEFAULT_STATE, LEGACY_TIMER_KEY, loadState(), MAQAR_TIMER_KEY, saveState(), TimerState, Props (+8 more)

### Community 39 - "jobs.ts"
Cohesion: 0.21
Nodes (14): GET(), isAuthorized(), POST(), safeEqual(), backoffMinutes(), claimJob(), enqueueJob(), ensureRecurringJobs() (+6 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 41 - "verify/route.ts"
Cohesion: 0.32
Nodes (10): db, E2E, isTestDatabase(), main(), POST(), decryptMfaSecret(), encryptMfaSecret(), generateRecoveryCodes() (+2 more)

### Community 42 - "lucide-react"
Cohesion: 0.13
Nodes (21): lucide-react, ConsentLayer(), ContractSummaryShowcase(), FOCUS_OPTIONS, TAG_STYLES, FinalCta(), HeroSection(), WORKSPACE_HIGHLIGHTS (+13 more)

### Community 43 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 45 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 46 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @axe-core/playwright@^4.13.0, bun-types@^1.3.4, eslint@^9, @tailwindcss/postcss@^4, tw-animate-css@^1.3.5, @types/file-saver@^2.0.7, @types/react@^19 (+12 more)

### Community 47 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:generate, db:migrate, db:push, db:reset, db:seed, debug (+13 more)

### Community 48 - "LawyerSectionView.tsx"
Cohesion: 0.12
Nodes (26): FirmSectionView(), dynamicParams, FirmSectionPage(), FIRM_PRACTICE_SECTIONS, firmHref(), FirmPracticeSection, isFirmPracticeSection(), CalendarView (+18 more)

### Community 49 - "@playwright/test"
Cohesion: 0.07
Nodes (11): authenticatedReadRoutes, hasOwnerCredentials, login(), protectedApiRoutes, protectedPages, publicRoutes, hasAdmin, hasLawyer (+3 more)

### Community 50 - "env"
Cohesion: 0.14
Nodes (17): env, DATABASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_MFA_SECRET, E2E_ADMIN_PASSWORD, E2E_BASE_URL, E2E_LAWYER_EMAIL, E2E_OWNER_EMAIL (+9 more)

### Community 51 - "register/route.ts"
Cohesion: 0.21
Nodes (9): addDays(), prisma, seedMaqarMultiTenantPlatform(), daysFromNow(), db, main(), POST(), hashPassword() (+1 more)

### Community 54 - "checkout/route.ts"
Cohesion: 0.21
Nodes (12): PLAN_PRICES_SAR, POST(), POST(), createMoyasarInvoice(), isMoyasarConfigured(), MoyasarInvoiceInput, MoyasarInvoiceResponse, verifyMoyasarWebhookSecret() (+4 more)

### Community 55 - "cn"
Cohesion: 0.06
Nodes (38): AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem() (+30 more)

### Community 56 - "app"
Cohesion: 0.12
Nodes (16): build, cap_drop, container_name, depends_on, environment, extra_hosts, image, ports (+8 more)

### Community 57 - "env"
Cohesion: 0.12
Nodes (13): docker-deploy.sh script, cleanup(), ping_backup_monitor(), backup-db.sh script, maqar-cache-purge-rebuild.sh script, run_cmd(), maqar-emergency-rollback.sh script, cleanup() (+5 more)

### Community 58 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 59 - "register/page.tsx"
Cohesion: 0.14
Nodes (13): addDays(), hashedPassword, main(), now, prisma, AcceptPrivacyPage(), ACCOUNT_OPTIONS, AccountType (+5 more)

### Community 60 - "portal-actions.tsx"
Cohesion: 0.29
Nodes (4): PortalActions(), PortalData, QuickStat(), Tab

### Community 62 - "app/layout.tsx"
Cohesion: 0.20
Nodes (10): next-themes@^0.4.6, next-themes, cairo, metadata, plexArabic, RootLayout(), viewport, ReactQueryProvider() (+2 more)

### Community 63 - "🇬🇧 English Summary"
Cohesion: 0.13
Nodes (14): Demo, Differentiation, 🇬🇧 English Summary, Problem, Solution, Stack, 📊 الأرقام, 🛠 التقنيات (+6 more)

### Community 64 - "reminders.ts"
Cohesion: 0.25
Nodes (10): GET(), isAuthorized(), POST(), safeEqual(), ComplianceStatusCheck, evaluateComplianceStatus(), formatRiyadhDateTime(), getStatutoryBasis() (+2 more)

### Community 65 - "flows.spec.ts"
Cohesion: 0.14
Nodes (5): __dirname, eslintConfig, __filename, eslint-config-next@^16.4.6, eslint-config-next

### Community 66 - "workflow/route.ts"
Cohesion: 0.29
Nodes (10): canActOnCase(), GET(), POST(), DELETE(), parseStages(), PATCH(), canManageWorkflow(), CASE_ASSIGNMENT_ROLES (+2 more)

### Community 67 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 68 - "updates"
Cohesion: 0.15
Nodes (12): dependency-type, development-dependencies, production-dependencies, dependency-type, interval, updates, directory, groups (+4 more)

### Community 70 - "chart.tsx"
Cohesion: 0.27
Nodes (10): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 71 - "with"
Cohesion: 0.21
Nodes (12): steps, if, name, run, uses, with, steps, cache (+4 more)

### Community 72 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, dir, display, icons, lang, name, orientation (+3 more)

### Community 73 - "form.tsx"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 74 - "next-auth"
Cohesion: 0.18
Nodes (18): DashboardPage(), canAccessPortal(), homePathFor(), homePortalFor(), isReadOnlyRole(), PORTAL_PATHS, PORTAL_ROLES, portalForPath() (+10 more)

### Community 75 - "db"
Cohesion: 0.18
Nodes (11): container_name, environment, image, ports, restart, security_opt, volumes, POSTGRES_DB (+3 more)

### Community 76 - "ts-sanad"
Cohesion: 0.18
Nodes (11): TS_AUTHKEY, TS_EXTRA_ARGS, TS_STATE_DIR, ts-sanad, container_name, environment, hostname, image (+3 more)

### Community 77 - "portal-links/route.ts"
Cohesion: 0.26
Nodes (10): GET(), POST(), DEFAULT_CHANNELS, deliverToChannel(), NotificationChannel, NotificationPayload, publishNotification(), sendEmailNotification() (+2 more)

### Community 78 - "toast.tsx"
Cohesion: 0.35
Nodes (9): Toast, ToastAction, ToastClose, ToastDescription, ToastTitle, toastVariants, ToastViewport, Toaster() (+1 more)

### Community 79 - "drawer.tsx"
Cohesion: 0.22
Nodes (7): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 80 - "env-audit.ts"
Cohesion: 0.16
Nodes (8): auditMaqarEnvironment(), EnvAuditIssue, EnvAuditResult, EnvModuleCategory, EnvVarSpec, MAQAR_ENV_SPECS, collectCodebaseEnvUsages(), ROOT_DIR

### Community 81 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 83 - "validate"
Cohesion: 0.22
Nodes (8): jobs, validate, name, permissions, contents, name, runs-on, services

### Community 84 - "ComplianceView.tsx"
Cohesion: 0.31
Nodes (9): CATEGORIES, ComplianceCard(), ComplianceView(), Props, SummaryTile(), Progress(), ComplianceItem, getDaysUntilBg() (+1 more)

### Community 85 - "PortalShell.tsx"
Cohesion: 0.12
Nodes (32): ClientPortalFrame(), ClientLayout(), metadata, CaseCard(), ClientCard(), DocumentCard(), InvoiceActions(), badgeClass() (+24 more)

### Community 86 - "index.tsx"
Cohesion: 0.33
Nodes (7): ar, TranslationKey, en, Ctx, Lang, LangCtx, translations

### Community 87 - "compliance.ts"
Cohesion: 0.32
Nodes (6): POST(), REQUEST_TYPES, CONTROLLER_NAME_AR, CONTROLLER_NAME_EN, PRIVACY_CONTACT_EMAIL, requestDeadline()

### Community 88 - "healthcheck"
Cohesion: 0.50
Nodes (8): healthcheck, healthcheck, interval, retries, start_period, test, timeout, healthcheck

### Community 89 - "options"
Cohesion: 0.36
Nodes (8): logging, logging, driver, options, max-file, max-size, logging, logging

### Community 90 - "postgres"
Cohesion: 0.25
Nodes (8): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, env, image, options, ports, postgres

### Community 91 - "maqar-tenant-prisma-extension.test.ts"
Cohesion: 0.36
Nodes (6): ActiveTenantSession, assertCrossTenantBoundary(), assertValidTenantSession(), buildTenantScopedWhere(), TenantIsolationViolationError, hasDb

### Community 92 - "edge-rate-limiter.ts"
Cohesion: 0.25
Nodes (7): AUTH_READONLY_BOOTSTRAP_ROUTES, BucketState, edgeBuckets, EdgeRateLimitDecision, MAQAR_RATE_LIMIT_TIERS, RateLimitTierConfig, resetEdgeRateLimiterForTests()

### Community 93 - "uptime-kuma"
Cohesion: 0.29
Nodes (7): uptime-kuma, container_name, image, ports, restart, security_opt, volumes

### Community 96 - "dev.sh"
Cohesion: 0.57
Nodes (5): log_step_end(), log_step_start(), dev.sh script, start_mini_services(), wait_for_service()

### Community 97 - "tailwindcss"
Cohesion: 0.33
Nodes (5): tailwindcss-animate@^1.0.7, tailwindcss@^4, tailwindcss, tailwindcss-animate, config

### Community 98 - "overrides"
Cohesion: 0.33
Nodes (6): overrides, deepmerge-ts, js-yaml, nanoid, postcss, prismjs

### Community 99 - "services"
Cohesion: 0.40
Nodes (4): services, volumes, sanad-postgres-data, sanad-uptime-kuma-data

### Community 100 - "on"
Cohesion: 0.40
Nodes (5): on, pull_request, push, branches, branches

### Community 103 - "client-portal-unified-view.tsx"
Cohesion: 0.10
Nodes (35): ForgotPasswordPage(), ClientPortalUnifiedView(), BottomNav(), CaseTimelineTab(), DataDeletionModal(), DocumentReviewModal(), ExpiredScreen(), GlossaryModal() (+27 more)

### Community 104 - "e2e"
Cohesion: 0.50
Nodes (4): name, runs-on, services, e2e

### Community 108 - "maqar-smoke-test.sh"
Cohesion: 0.90
Nodes (4): check_status(), fail(), pass(), maqar-smoke-test.sh script

### Community 123 - "codemod-sanad-to-maqar.mts"
Cohesion: 0.22
Nodes (4): collectTsFiles(), MODULE_REWRITES, ROOTS, ROOT_DIR

### Community 126 - "prune-imports.mjs"
Cohesion: 0.22
Nodes (8): typescript@^5, typescript, formatImport(), prune(), require, ROOT, ts, usedIdentifiers()

### Community 132 - "مَقَرّ (Maqar)"
Cohesion: 0.09
Nodes (20): Code structure & conventions, Layout, Rules of thumb, Worked example: client portal (`src/app/portal/[token]`), Background jobs, Environment variables, Environments, File structure (+12 more)

### Community 133 - "seed_clients.ts"
Cohesion: 0.50
Nodes (3): daysFromNow(), db, main()

## Knowledge Gaps
- **2 isolated node(s):** `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 731 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `getAuthContext`, `notFoundJson`, `use-security-settings.ts`, `ClientsView.tsx`, `rateLimit`, `register/route.ts`, `dependencies`, `package.json`, `entitlements.ts`, `onboarding/page.tsx`, `index.ts`, `workspace.ts`, `[token]/route.ts`, `FirmTeamPage.tsx`, `LandingHeader`, `events.ts`, `react`, `use-admin.ts`, `PortalShell.tsx`, `jobs.ts`, `verify/route.ts`, `lucide-react`, `LawyerSectionView.tsx`, `register/route.ts`, `robots.ts`, `sitemap.ts`, `checkout/route.ts`, `register/page.tsx`, `portal-actions.tsx`, `app/layout.tsx`, `reminders.ts`, `workflow/route.ts`, `next-auth`, `portal-links/route.ts`, `PortalShell.tsx`, `compliance.ts`, `verify-email/route.ts`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.230) - this node is a cross-community bridge._
- **What connects `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getAuthContext` be split into smaller, more focused modules?**
  _Cohesion score 0.08937691521961184 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `use-toast.ts`, `package.json`, `onboarding/page.tsx`, `utils.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `app/workflow/page.tsx`, `sheet.tsx`, `use-admin.ts`, `PortalShell.tsx`, `use-deep-work.ts`, `lucide-react`, `pagination.tsx`, `cn`, `menubar.tsx`, `register/page.tsx`, `portal-actions.tsx`, `carousel.tsx`, `chart.tsx`, `form.tsx`, `toast.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `ComplianceView.tsx`, `PortalShell.tsx`, `index.tsx`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `ClientsView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11389759665621735 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `package.json`, `onboarding/page.tsx`, `utils.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `react`, `app/workflow/page.tsx`, `sheet.tsx`, `PortalShell.tsx`, `use-deep-work.ts`, `pagination.tsx`, `cn`, `menubar.tsx`, `register/page.tsx`, `portal-actions.tsx`, `carousel.tsx`, `toast.tsx`, `navigation-menu.tsx`, `ComplianceView.tsx`, `PortalShell.tsx`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `rateLimit` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._