# Graph Report - maqar-next-security-upgrade  (2026-11-20)

## Corpus Check
- 450 files · ~204,806 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, . 2, .example 1)

## Summary
- 2380 nodes · 7720 edges · 129 communities (95 shown, 34 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c2fff75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getAuthContext
- notFoundJson
- index.tsx
- Input
- index.tsx
- ClientsView.tsx
- next
- request/route.ts
- core/types.ts
- CoursesPanel
- dependencies
- cn
- environment
- app/layout.tsx
- package.json
- entitlements.ts
- prisma-tenant-extension.ts
- split-module.mjs
- app/workflow/page.tsx
- index.ts
- signature/route.ts
- utils.ts
- getTenantDb
- re
- [token]/route.ts
- useLang
- FirmTeamPage.tsx
- LandingHeader
- LawyerPortalFrame.tsx
- CaseCard.tsx
- immutable-audit-log.ts
- jobs.ts
- سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل
- sheet.tsx
- codeql.yml
- use-admin.ts
- vault-envelope-encryption.ts
- reminders.ts
- workflow/route.ts
- workspace-isolation.test.ts
- compilerOptions
- verify/route.ts
- app/page.tsx
- NotificationCenter.tsx
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
- clsx
- cn
- app
- restore-drill.sh
- breadcrumb.tsx
- register/page.tsx
- dropdown-menu.tsx
- zod
- context-menu.tsx
- 🇬🇧 English Summary
- next-auth
- flows.spec.ts
- accordion.tsx
- carousel.tsx
- updates
- input-otp.tsx
- chart.tsx
- with
- manifest.json
- form.tsx
- next-auth
- db
- ts-sanad
- ref_crypto
- backup-db.sh
- drawer.tsx
- env-audit.ts
- navigation-menu.tsx
- validate
- maqar-emergency-rollback.sh
- PortalShell.tsx
- docker-deploy.sh
- @dnd-kit/utilities@^3.2.2
- healthcheck
- options
- postgres
- maqar-security-hardening.test.ts
- @mdxeditor/editor
- uptime-kuma
- prisma@^6.11.1
- dev.sh
- tailwindcss
- overrides
- services
- on
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- client-portal-unified-view.tsx
- e2e
- @radix-ui/react-progress
- @radix-ui/react-aspect-ratio
- @radix-ui/react-switch
- maqar-smoke-test.sh
- build.sh
- start.sh
- docker-entrypoint.sh
- react-dom@^19.0.0
- vaul
- maqar-cache-purge-rebuild.sh
- run-cron.sh
- warm-ai.sh
- emailjs
- @hookform/resolvers@^5.1.1
- codemod-sanad-to-maqar.mts
- prune-imports.mjs
- postcss.config.mjs
- sw.js
- مَقَرّ (Maqar)
- seed_clients.ts
- uqr
- docx
- @radix-ui/react-radio-group

## God Nodes (most connected - your core abstractions)
1. `cn()` - 232 edges
2. `getAuthContext()` - 188 edges
3. `unauthorizedJson()` - 181 edges
4. `Button()` - 168 edges
5. `next` - 143 edges
6. `lucide-react` - 121 edges
7. `react` - 106 edges
8. `useLang()` - 93 edges
9. `notFoundJson()` - 83 edges
10. `db` - 83 edges

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

## Communities (129 total, 34 thin omitted)

### Community 0 - "getAuthContext"
Cohesion: 0.09
Nodes (60): GET(), GET(), PUT(), targetWorkspace(), PATCH(), GET(), GET(), PATCH() (+52 more)

### Community 1 - "notFoundJson"
Cohesion: 0.16
Nodes (42): DECISIONS, PATCH(), POST(), DELETE(), PATCH(), DELETE(), PATCH(), DELETE() (+34 more)

### Community 2 - "index.tsx"
Cohesion: 0.09
Nodes (26): ConsentLayer(), usePortalView(), handleSendChatMessage(), handleVerifyOtp(), DeepWorkHeader(), DEFAULT_STATE, LEGACY_TIMER_KEY, loadState() (+18 more)

### Community 3 - "Input"
Cohesion: 0.07
Nodes (31): FirmOnboardingPage(), complete(), inviteMember(), mutate(), saveIdentity(), AuthLocale, LoginPage(), safeCallbackUrl() (+23 more)

### Community 4 - "index.tsx"
Cohesion: 0.20
Nodes (22): Props, InvoicePreviewDialog(), InvoiceRow(), STATUS_COLORS, STATUS_FILTERS, StatTile(), InvoicesView(), Props (+14 more)

### Community 5 - "ClientsView.tsx"
Cohesion: 0.12
Nodes (64): react, sonner, AddCaseDialog(), CLIENT_TYPES, ClientFormDialog(), FormState, CommandAction, CommandPalette() (+56 more)

### Community 6 - "next"
Cohesion: 0.08
Nodes (42): nextConfig, next, patchSchema, ACTIONS, POST(), POST(), VALID_FOCUS, KNOWN_EVENTS (+34 more)

### Community 7 - "request/route.ts"
Cohesion: 0.17
Nodes (24): POST(), ACCOUNT_TYPES, AccountType, getClientIp(), POST(), recordPrivacyAcceptance(), Tx, ALLOWED_ROLES (+16 more)

### Community 8 - "core/types.ts"
Cohesion: 0.05
Nodes (61): @dnd-kit/core@^6.3.1, @dnd-kit/core, TimeTabProps, CaseDetail, CASE_TYPES, PRIORITIES, STAGES, DraggableCase() (+53 more)

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (51): dependencies, cmdk@^1.1.1, date-fns@^4.1.0, @dnd-kit/sortable@^10.0.0, file-saver@^2.0.5, input-otp@^1.4.2, lucide-react@^0.525.0, next@^16.4.6 (+43 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (32): SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction(), SidebarGroupContent(), SidebarGroupLabel() (+24 more)

### Community 12 - "environment"
Cohesion: 0.04
Nodes (48): cap_drop, container_name, depends_on, environment, extra_hosts, healthcheck, image, ports (+40 more)

### Community 13 - "app/layout.tsx"
Cohesion: 0.09
Nodes (32): cairo, metadata, plexArabic, RootLayout(), viewport, ReactQueryProvider(), SessionProvider(), ThemeProvider() (+24 more)

### Community 14 - "package.json"
Cohesion: 0.05
Nodes (43): embla-carousel-react@^8.6.0, @radix-ui/react-alert-dialog@^1.1.14, @radix-ui/react-context-menu@^2.2.15, @radix-ui/react-dialog@^1.1.14, @radix-ui/react-dropdown-menu@^2.1.15, @radix-ui/react-popover@^1.1.14, @radix-ui/react-select@^2.2.5, @radix-ui/react-separator@^1.1.7 (+35 more)

### Community 15 - "entitlements.ts"
Cohesion: 0.07
Nodes (49): ANALYSIS_TYPES, buildFallbackAnalysis(), POST(), StructuredAnalysis, POST(), simulateDraft(), AiState, dynamic (+41 more)

### Community 16 - "prisma-tenant-extension.ts"
Cohesion: 0.11
Nodes (24): assertNoCrossTenantMutationFields(), assertValidScopeContext(), assertWorkspacePresent(), buildTenantFilter(), BULK_WRITE_OPS, createAsyncContextTenantPrisma(), createTenantIsolationExtension(), createTenantScopedPrisma() (+16 more)

### Community 17 - "split-module.mjs"
Cohesion: 0.09
Nodes (18): cfg, importTexts, mainHeader, mainParts, mainReexports, outputs, reexports, require (+10 more)

### Community 18 - "app/workflow/page.tsx"
Cohesion: 0.09
Nodes (16): FirmWorkflowPage(), LawyerWorkflowPage(), Approval, Assignment, Client, EmptyState(), Member, PortalRequest (+8 more)

### Community 19 - "index.ts"
Cohesion: 0.07
Nodes (31): createCaseEntrySchema, createCaseSchema, createClientSchema, createCommunicationSchema, createComplianceSchema, createCourseSchema, createDeadlineSchema, createDocumentSchema (+23 more)

### Community 20 - "signature/route.ts"
Cohesion: 0.22
Nodes (18): GET(), runtime, GET(), POST(), runtime, GET(), runtime, GET() (+10 more)

### Community 21 - "utils.ts"
Cohesion: 0.09
Nodes (16): class-variance-authority@^0.7.1, class-variance-authority, Alert(), AlertDescription(), AlertTitle(), alertVariants, HoverCardContent(), ResizableHandle() (+8 more)

### Community 22 - "getTenantDb"
Cohesion: 0.13
Nodes (31): emptyDashboard(), getLawyerDashboard(), legalWorkspace(), GET(), GET(), POST(), GET(), GET() (+23 more)

### Community 23 - "re"
Cohesion: 0.15
Nodes (13): build_imports(), import_symbols(), main(), parse(), rewrite_mod(), used(), dedent(), imports_for() (+5 more)

### Community 24 - "[token]/route.ts"
Cohesion: 0.05
Nodes (58): GET(), ip(), POST(), runtime, workspaceRecipients(), ClientPage(), ClientPortal(), AlertDeliveredEvent (+50 more)

### Community 25 - "useLang"
Cohesion: 0.08
Nodes (70): recharts, ClientDashboard(), steps, HomeTab(), CalendarEvent, CalendarView(), COLOR_BADGE, COLOR_BORDER (+62 more)

### Community 26 - "FirmTeamPage.tsx"
Cohesion: 0.17
Nodes (17): FirmAssignments(), FirmAssignmentsPage(), FirmOverviewPage(), FirmSettingsPage(), FirmTeamPage(), INVITE_ROLES, FirmLoading(), Panel() (+9 more)

### Community 27 - "LandingHeader"
Cohesion: 0.14
Nodes (20): AboutPage(), metadata, AiDisclosurePage(), metadata, LandingFooter(), LandingHeader(), NAV_ITEMS, BillingCycle (+12 more)

### Community 28 - "LawyerPortalFrame.tsx"
Cohesion: 0.13
Nodes (19): @tanstack/react-query@^5.82.0, @tanstack/react-query, ACTIVE_STAGES_EXCLUDED, FirmCaseRow, FirmDashboard, FirmMember, getFirmDashboard(), FirmPortalFrame() (+11 more)

### Community 29 - "CaseCard.tsx"
Cohesion: 0.30
Nodes (19): CaseCard(), ClientCard(), InvoiceActions(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+11 more)

### Community 30 - "immutable-audit-log.ts"
Cohesion: 0.29
Nodes (9): buildChainedAuditRecord(), ChainedAuditEnvelope, computeAuditChainHash(), GENESIS_AUDIT_CHAIN_HASH, getAuditHmacKey(), ImmutableAuditInput, MandatoryAuditAction, recordImmutableAuditEvent() (+1 more)

### Community 31 - "jobs.ts"
Cohesion: 0.19
Nodes (15): vitest, GET(), isAuthorized(), POST(), safeEqual(), backoffMinutes(), claimJob(), enqueueJob() (+7 more)

### Community 32 - "سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل"
Cohesion: 0.09
Nodes (21): Product Roadmap & Client Portal UX Specification, الشاشة الأولى: شاشة التحقق الآمن (Secure Entry & OTP Verification), الشاشة الثالثة: مسار الخط الزمني القضائي (Visual Case Journey), الشاشة الثانية: اللوحة الرئيسية للموكل (Client Mobile-First Dashboard), الشاشة الخامسة: مراجعة المستندات والتوقيع الإلكتروني (E-Signature & Approval), الشاشة الرابعة: الفواتير والسداد الإلكتروني (ZATCA Invoices & Instant Checkout), 📌 المرحلة الأولى: تعزيز التحويل وتأمين قيمة المحامي الأساسية (Sprint 1 - 2), 📌 المرحلة الثالثة: مسارات الطلاب والتدريب المهني (Sprint 5 - 6) (+13 more)

### Community 33 - "sheet.tsx"
Cohesion: 0.26
Nodes (9): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+1 more)

### Community 34 - "codeql.yml"
Cohesion: 0.10
Nodes (20): runs-on, steps, timeout-minutes, jobs, analyze, name, on, pull_request (+12 more)

### Community 35 - "use-admin.ts"
Cohesion: 0.19
Nodes (11): AdminHeader(), AdminNotice(), AdminStatusSection(), Card(), Status, AdminState, useAdmin(), updatePrivacyRequest() (+3 more)

### Community 36 - "vault-envelope-encryption.ts"
Cohesion: 0.31
Nodes (8): buildCanonicalAad(), decryptLegalVaultPayload(), deriveTenantKek(), EncryptedVaultEnvelope, encryptLegalVaultPayload(), getMasterKmsSecret(), LegalDataClassification, VaultEncryptionContext

### Community 37 - "reminders.ts"
Cohesion: 0.25
Nodes (10): GET(), isAuthorized(), POST(), safeEqual(), ComplianceStatusCheck, evaluateComplianceStatus(), formatRiyadhDateTime(), getStatutoryBasis() (+2 more)

### Community 38 - "workflow/route.ts"
Cohesion: 0.29
Nodes (10): canActOnCase(), POST(), DELETE(), parseStages(), PATCH(), AuthContext, canManageWorkflow(), CASE_ASSIGNMENT_ROLES (+2 more)

### Community 39 - "workspace-isolation.test.ts"
Cohesion: 0.25
Nodes (6): runRetentionSweep(), SOFT_DELETABLE, createWorkspace(), db, hasDb, RUN_ID

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 41 - "verify/route.ts"
Cohesion: 0.32
Nodes (10): db, E2E, isTestDatabase(), main(), POST(), decryptMfaSecret(), encryptMfaSecret(), generateRecoveryCodes() (+2 more)

### Community 42 - "app/page.tsx"
Cohesion: 0.10
Nodes (26): ContractSummaryShowcase(), FOCUS_OPTIONS, TAG_STYLES, FinalCta(), HeroSection(), WORKSPACE_HIGHLIGHTS, HowItWorksSection(), STEPS (+18 more)

### Community 43 - "NotificationCenter.tsx"
Cohesion: 0.38
Nodes (7): AppNotification, formatRelativeTime(), getNotificationIcon(), NotificationCenter(), Popover(), PopoverContent(), PopoverTrigger()

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
Nodes (25): FirmSectionView(), dynamicParams, FirmSectionPage(), FIRM_PRACTICE_SECTIONS, firmHref(), FirmPracticeSection, isFirmPracticeSection(), CalendarView (+17 more)

### Community 49 - "@playwright/test"
Cohesion: 0.07
Nodes (13): authenticatedReadRoutes, hasOwnerCredentials, login(), protectedApiRoutes, protectedPages, publicRoutes, hasAdmin, hasLawyer (+5 more)

### Community 50 - "env"
Cohesion: 0.14
Nodes (17): env, DATABASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_MFA_SECRET, E2E_ADMIN_PASSWORD, E2E_BASE_URL, E2E_LAWYER_EMAIL, E2E_OWNER_EMAIL (+9 more)

### Community 51 - "register/route.ts"
Cohesion: 0.22
Nodes (11): addDays(), prisma, seedMaqarMultiTenantPlatform(), daysFromNow(), db, main(), POST(), POST() (+3 more)

### Community 55 - "cn"
Cohesion: 0.07
Nodes (36): Avatar(), AvatarFallback(), AvatarImage(), CardAction(), CardFooter(), Command(), CommandGroup(), CommandInput() (+28 more)

### Community 56 - "app"
Cohesion: 0.12
Nodes (16): build, cap_drop, container_name, depends_on, environment, extra_hosts, image, ports (+8 more)

### Community 57 - "restore-drill.sh"
Cohesion: 0.60
Nodes (4): cleanup(), FILE_ENCRYPTION_KEY, ping_drill_monitor(), restore-drill.sh script

### Community 58 - "breadcrumb.tsx"
Cohesion: 0.25
Nodes (6): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 59 - "register/page.tsx"
Cohesion: 0.21
Nodes (9): addDays(), hashedPassword, main(), now, prisma, CONTROLLER_NAME_AR, CONTROLLER_NAME_EN, PRIVACY_CONTACT_EMAIL (+1 more)

### Community 60 - "dropdown-menu.tsx"
Cohesion: 0.20
Nodes (5): DropdownMenuCheckboxItem(), DropdownMenuRadioItem(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 61 - "zod"
Cohesion: 0.50
Nodes (3): zod@^4.0.2, zod, forgotPasswordSchema

### Community 62 - "context-menu.tsx"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 63 - "🇬🇧 English Summary"
Cohesion: 0.13
Nodes (14): Demo, Differentiation, 🇬🇧 English Summary, Problem, Solution, Stack, 📊 الأرقام, 🛠 التقنيات (+6 more)

### Community 64 - "next-auth"
Cohesion: 0.39
Nodes (4): next-auth@^4.24.15, next-auth, authOptions, clearRateLimit()

### Community 65 - "flows.spec.ts"
Cohesion: 0.14
Nodes (5): __dirname, eslintConfig, __filename, eslint-config-next@^16.4.6, eslint-config-next

### Community 66 - "accordion.tsx"
Cohesion: 0.40
Nodes (3): AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 67 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 68 - "updates"
Cohesion: 0.15
Nodes (12): dependency-type, development-dependencies, production-dependencies, dependency-type, interval, updates, directory, groups (+4 more)

### Community 69 - "input-otp.tsx"
Cohesion: 0.40
Nodes (3): InputOTP(), InputOTPGroup(), InputOTPSlot()

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
Cohesion: 0.20
Nodes (16): DashboardPage(), canAccessPortal(), homePathFor(), homePortalFor(), isReadOnlyRole(), PORTAL_PATHS, PORTAL_ROLES, portalForPath() (+8 more)

### Community 75 - "db"
Cohesion: 0.18
Nodes (11): container_name, environment, image, ports, restart, security_opt, volumes, POSTGRES_DB (+3 more)

### Community 76 - "ts-sanad"
Cohesion: 0.18
Nodes (11): TS_AUTHKEY, TS_EXTRA_ARGS, TS_STATE_DIR, ts-sanad, container_name, environment, hostname, image (+3 more)

### Community 78 - "backup-db.sh"
Cohesion: 0.83
Nodes (3): cleanup(), ping_backup_monitor(), backup-db.sh script

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

### Community 85 - "PortalShell.tsx"
Cohesion: 0.12
Nodes (21): next-themes@^0.4.6, next-themes, ClientPortalFrame(), sections, ClientLayout(), metadata, badgeClass(), isActive() (+13 more)

### Community 88 - "healthcheck"
Cohesion: 0.50
Nodes (8): healthcheck, healthcheck, interval, retries, start_period, test, timeout, healthcheck

### Community 89 - "options"
Cohesion: 0.36
Nodes (8): logging, logging, driver, options, max-file, max-size, logging, logging

### Community 90 - "postgres"
Cohesion: 0.25
Nodes (8): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, env, image, options, ports, postgres

### Community 91 - "maqar-security-hardening.test.ts"
Cohesion: 0.19
Nodes (11): MaqarRlsContext, withTenantRls(), AUTH_READONLY_BOOTSTRAP_ROUTES, BucketState, edgeBuckets, EdgeRateLimitDecision, evaluateEdgeRateLimit(), MAQAR_RATE_LIMIT_TIERS (+3 more)

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
Cohesion: 0.09
Nodes (39): lucide-react, ForgotPasswordPage(), ClientPortalUnifiedView(), ActivationScreen(), BottomNav(), CaseTimelineTab(), DataDeletionModal(), DocumentReviewModal() (+31 more)

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
Cohesion: 0.29
Nodes (5): @prisma/client, daysFromNow(), db, main(), prisma

## Knowledge Gaps
- **2 isolated node(s):** `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 732 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `getAuthContext`, `notFoundJson`, `index.tsx`, `Input`, `ClientsView.tsx`, `request/route.ts`, `dependencies`, `app/layout.tsx`, `package.json`, `entitlements.ts`, `index.ts`, `signature/route.ts`, `getTenantDb`, `[token]/route.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `LawyerPortalFrame.tsx`, `jobs.ts`, `use-admin.ts`, `reminders.ts`, `workflow/route.ts`, `verify/route.ts`, `app/page.tsx`, `NotificationCenter.tsx`, `LawyerSectionView.tsx`, `register/route.ts`, `robots.ts`, `sitemap.ts`, `next-auth`, `next-auth`, `ref_crypto`, `PortalShell.tsx`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **What connects `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getAuthContext` be split into smaller, more focused modules?**
  _Cohesion score 0.09261790840738209 - nodes in this community are weakly interconnected._
- **Why does `react` connect `ClientsView.tsx` to `index.tsx`, `Input`, `index.tsx`, `core/types.ts`, `dependencies`, `cn`, `app/layout.tsx`, `package.json`, `app/workflow/page.tsx`, `utils.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `LawyerPortalFrame.tsx`, `CaseCard.tsx`, `sheet.tsx`, `use-admin.ts`, `app/page.tsx`, `NotificationCenter.tsx`, `cn`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `accordion.tsx`, `carousel.tsx`, `input-otp.tsx`, `chart.tsx`, `form.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `PortalShell.tsx`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Input`, `index.tsx`, `ClientsView.tsx`, `cn`, `app/layout.tsx`, `utils.ts`, `useLang`, `CaseCard.tsx`, `sheet.tsx`, `NotificationCenter.tsx`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `accordion.tsx`, `carousel.tsx`, `input-otp.tsx`, `chart.tsx`, `form.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `PortalShell.tsx`, `client-portal-unified-view.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Input` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._