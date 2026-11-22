# Graph Report - sanad  (2026-11-22)

## Corpus Check
- 456 files · ~209,589 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, . 2, .example 1)

## Summary
- 2403 nodes · 7839 edges · 135 communities (100 shown, 35 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3da2de9c`
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
- workspace-isolation.test.ts
- prisma-tenant-extension.ts
- split-module.mjs
- card.tsx
- index.ts
- caseLinkedAccessWhere
- utils.ts
- entitlements.ts
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
- signature/route.ts
- codeql.yml
- use-admin.ts
- vault-envelope-encryption.ts
- PortalShell.tsx
- use-deep-work.ts
- jobs.ts
- compilerOptions
- context-menu.tsx
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
- class-variance-authority
- zod
- app/layout.tsx
- 🇬🇧 English Summary
- ContractSummaryShowcase.tsx
- flows.spec.ts
- InteractiveDemo.tsx
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
- portal-security.test.ts
- PortalShell.tsx
- index.tsx
- client-portal.ts
- healthcheck
- options
- postgres
- maqar-security-hardening.test.ts
- NotificationCenter.tsx
- uptime-kuma
- verify-email/route.ts
- dev.sh
- tailwindcss
- overrides
- services
- on
- cron/jobs/route.ts
- FirmSettingsPage
- client-portal-unified-view.tsx
- e2e
- next.config.ts
- @radix-ui/react-aspect-ratio
- clsx
- maqar-smoke-test.sh
- build.sh
- start.sh
- docker-entrypoint.sh
- docx@^9.7.1
- emailjs
- file-saver@^2.0.5
- next-themes
- @radix-ui/react-checkbox
- @radix-ui/react-dialog
- @radix-ui/react-menubar
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- vaul
- codemod-sanad-to-maqar.mts
- react-hook-form
- react-markdown@^10.1.0
- prune-imports.mjs
- sharp@^0.35.4
- stripe@^22.6.2
- postcss.config.mjs
- sw.js
- مَقَرّ (Maqar)
- seed_clients.ts
- @tanstack/react-table@^8.21.3

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
- `main()` --calls--> `hashRecoveryCode()`  [EXTRACTED]
  scripts/seed_e2e.ts → src/lib/auth/mfa.ts
- `seedMaqarMultiTenantPlatform()` --calls--> `hashPassword()`  [EXTRACTED]
  prisma/seed.ts → src/lib/auth/password.ts

## Import Cycles
- None detected.

## Communities (135 total, 35 thin omitted)

### Community 0 - "getAuthContext"
Cohesion: 0.09
Nodes (69): next, GET(), GET(), PUT(), targetWorkspace(), PATCH(), patchSchema, GET() (+61 more)

### Community 1 - "notFoundJson"
Cohesion: 0.15
Nodes (43): DECISIONS, PATCH(), POST(), DELETE(), PATCH(), DELETE(), PATCH(), DELETE() (+35 more)

### Community 2 - "usePortalView"
Cohesion: 0.19
Nodes (8): ConsentLayer(), usePortalView(), handleConfirmPayment(), handleSendChatMessage(), handleVerifyOtp(), LanguageProvider(), getMigratedItem(), setMigratedItem()

### Community 3 - "use-security-settings.ts"
Cohesion: 0.16
Nodes (12): ChangePasswordSection(), DataPrivacySection(), MfaSection(), NotificationPreferencesSection(), SecurityHeader(), SecuritySettingsState, useSecuritySettings(), defaultPrefs() (+4 more)

### Community 4 - "index.tsx"
Cohesion: 0.30
Nodes (14): InvoicePreviewDialog(), InvoiceRow(), STATUS_COLORS, STATUS_FILTERS, StatTile(), InvoicesView(), Table(), TableBody() (+6 more)

### Community 5 - "ClientsView.tsx"
Cohesion: 0.11
Nodes (65): AddCaseDialog(), CLIENT_TYPES, ClientFormDialog(), FormState, CommandAction, CommandPalette(), Props, SearchResult (+57 more)

### Community 6 - "rateLimit"
Cohesion: 0.12
Nodes (32): otplib, POST(), POST(), VALID_FOCUS, KNOWN_EVENTS, POST(), POST(), POST() (+24 more)

### Community 7 - "register/route.ts"
Cohesion: 0.23
Nodes (15): POST(), ACCOUNT_TYPES, AccountType, getClientIp(), POST(), recordPrivacyAcceptance(), Tx, forgotPasswordSchema (+7 more)

### Community 8 - "core/types.ts"
Cohesion: 0.05
Nodes (56): @dnd-kit/core, TimeTabProps, CaseDetail, CASE_TYPES, PRIORITIES, STAGES, KanbanColumn(), Props (+48 more)

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (51): dependencies, cmdk@^1.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, embla-carousel-react@^8.6.0, @hookform/resolvers@^5.1.1, lucide-react@^0.525.0 (+43 more)

### Community 11 - "cn"
Cohesion: 0.06
Nodes (46): CaseDetailDrawer(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal() (+38 more)

### Community 12 - "environment"
Cohesion: 0.04
Nodes (48): cap_drop, container_name, depends_on, environment, extra_hosts, healthcheck, image, ports (+40 more)

### Community 13 - "use-toast.ts"
Cohesion: 0.17
Nodes (15): ToastActionElement, ToastProps, Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId() (+7 more)

### Community 14 - "package.json"
Cohesion: 0.05
Nodes (43): input-otp@^1.4.2, @mdxeditor/editor@^3.39.1, prisma@^6.11.1, @radix-ui/react-alert-dialog@^1.1.14, @radix-ui/react-dropdown-menu@^2.1.15, @radix-ui/react-popover@^1.1.14, @radix-ui/react-progress@^1.1.7, @radix-ui/react-slider@^1.3.5 (+35 more)

### Community 15 - "workspace-isolation.test.ts"
Cohesion: 0.25
Nodes (6): runRetentionSweep(), SOFT_DELETABLE, createWorkspace(), db, hasDb, RUN_ID

### Community 16 - "prisma-tenant-extension.ts"
Cohesion: 0.12
Nodes (19): assertNoCrossTenantMutationFields(), assertValidScopeContext(), assertWorkspacePresent(), buildTenantFilter(), BULK_WRITE_OPS, createAsyncContextTenantPrisma(), createTenantIsolationExtension(), createTenantScopedPrisma() (+11 more)

### Community 17 - "split-module.mjs"
Cohesion: 0.09
Nodes (18): cfg, importTexts, mainHeader, mainParts, mainReexports, outputs, reexports, require (+10 more)

### Community 18 - "card.tsx"
Cohesion: 0.17
Nodes (13): ClientDashboard(), FirmOnboardingPage(), complete(), inviteMember(), mutate(), saveIdentity(), CasePortalTab(), PortalLinkData (+5 more)

### Community 19 - "index.ts"
Cohesion: 0.06
Nodes (57): GET(), POST(), GET(), POST(), GET(), POST(), GET(), isAuthorized() (+49 more)

### Community 20 - "caseLinkedAccessWhere"
Cohesion: 0.16
Nodes (20): emptyDashboard(), getLawyerDashboard(), legalWorkspace(), GET(), GET(), GET(), GET(), GET() (+12 more)

### Community 21 - "utils.ts"
Cohesion: 0.13
Nodes (7): Calendar(), CalendarDayButton(), HoverCardContent(), ResizableHandle(), ResizablePanelGroup(), Slider(), Switch()

### Community 22 - "entitlements.ts"
Cohesion: 0.08
Nodes (41): ANALYSIS_TYPES, buildFallbackAnalysis(), POST(), StructuredAnalysis, POST(), simulateDraft(), AiState, dynamic (+33 more)

### Community 23 - "re"
Cohesion: 0.15
Nodes (13): build_imports(), import_symbols(), main(), parse(), rewrite_mod(), used(), dedent(), imports_for() (+5 more)

### Community 24 - "[token]/route.ts"
Cohesion: 0.17
Nodes (21): GET(), runtime, GET(), ip(), POST(), runtime, workspaceRecipients(), ALLOWED_EXTENSIONS (+13 more)

### Community 25 - "useLang"
Cohesion: 0.12
Nodes (52): CalendarView(), DateHeader(), EventCard(), AiInsightsTab(), CommsTab(), DocumentsTab(), InvoicesTab(), COMM_TYPE_META (+44 more)

### Community 26 - "FirmTeamPage.tsx"
Cohesion: 0.21
Nodes (16): FirmAssignments(), FirmAssignmentsPage(), FirmOverviewPage(), FirmTeamPage(), INVITE_ROLES, FirmLoading(), Panel(), ROLE_LABELS (+8 more)

### Community 27 - "LandingHeader"
Cohesion: 0.14
Nodes (20): AboutPage(), metadata, AiDisclosurePage(), metadata, LandingFooter(), LandingHeader(), NAV_ITEMS, BillingCycle (+12 more)

### Community 28 - "events.ts"
Cohesion: 0.18
Nodes (17): AlertDeliveredEvent, AnalyticsEvent, AnalyticsEventBase, AnalyticsEventInput, AnalyticsEventName, ClauseCheckCompletedEvent, ClauseCheckStartedEvent, DistributiveOmit (+9 more)

### Community 29 - "react"
Cohesion: 0.14
Nodes (17): ACTIVE_STAGES_EXCLUDED, FirmCaseRow, FirmDashboard, FirmMember, getFirmDashboard(), FirmPortalFrame(), FirmLayout(), metadata (+9 more)

### Community 30 - "immutable-audit-log.ts"
Cohesion: 0.29
Nodes (9): buildChainedAuditRecord(), ChainedAuditEnvelope, computeAuditChainHash(), GENESIS_AUDIT_CHAIN_HASH, getAuditHmacKey(), ImmutableAuditInput, MandatoryAuditAction, recordImmutableAuditEvent() (+1 more)

### Community 31 - "app/workflow/page.tsx"
Cohesion: 0.09
Nodes (16): FirmWorkflowPage(), LawyerWorkflowPage(), Approval, Assignment, Client, EmptyState(), Member, PortalRequest (+8 more)

### Community 32 - "سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل"
Cohesion: 0.09
Nodes (21): Product Roadmap & Client Portal UX Specification, الشاشة الأولى: شاشة التحقق الآمن (Secure Entry & OTP Verification), الشاشة الثالثة: مسار الخط الزمني القضائي (Visual Case Journey), الشاشة الثانية: اللوحة الرئيسية للموكل (Client Mobile-First Dashboard), الشاشة الخامسة: مراجعة المستندات والتوقيع الإلكتروني (E-Signature & Approval), الشاشة الرابعة: الفواتير والسداد الإلكتروني (ZATCA Invoices & Instant Checkout), 📌 المرحلة الأولى: تعزيز التحويل وتأمين قيمة المحامي الأساسية (Sprint 1 - 2), 📌 المرحلة الثالثة: مسارات الطلاب والتدريب المهني (Sprint 5 - 6) (+13 more)

### Community 33 - "signature/route.ts"
Cohesion: 0.24
Nodes (15): GET(), runtime, GET(), POST(), runtime, GET(), runtime, POST() (+7 more)

### Community 34 - "codeql.yml"
Cohesion: 0.10
Nodes (20): runs-on, steps, timeout-minutes, jobs, analyze, name, on, pull_request (+12 more)

### Community 35 - "use-admin.ts"
Cohesion: 0.19
Nodes (11): AdminHeader(), AdminNotice(), AdminStatusSection(), Card(), Status, AdminState, useAdmin(), updatePrivacyRequest() (+3 more)

### Community 36 - "vault-envelope-encryption.ts"
Cohesion: 0.31
Nodes (8): buildCanonicalAad(), decryptLegalVaultPayload(), deriveTenantKek(), EncryptedVaultEnvelope, encryptLegalVaultPayload(), getMasterKmsSecret(), LegalDataClassification, VaultEncryptionContext

### Community 37 - "PortalShell.tsx"
Cohesion: 0.13
Nodes (19): ClientPortalFrame(), sections, ClientLayout(), metadata, badgeClass(), isActive(), NavBadge, NavItem (+11 more)

### Community 38 - "use-deep-work.ts"
Cohesion: 0.22
Nodes (13): DeepWorkHeader(), DEFAULT_STATE, LEGACY_TIMER_KEY, loadState(), MAQAR_TIMER_KEY, saveState(), TimerState, Props (+5 more)

### Community 39 - "jobs.ts"
Cohesion: 0.13
Nodes (21): hashToken(), POST(), ComplianceStatusCheck, evaluateComplianceStatus(), buildStyledArabicEmailHtml(), client(), emailConfigured(), escapeHtml() (+13 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 41 - "context-menu.tsx"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 42 - "lucide-react"
Cohesion: 0.22
Nodes (10): FinalCta(), HeroSection(), WORKSPACE_HIGHLIGHTS, HowItWorksSection(), STEPS, TargetAudienceSection(), TRUST_CARDS, TrustLayerSection() (+2 more)

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
Nodes (25): FirmSectionView(), dynamicParams, FirmSectionPage(), FIRM_PRACTICE_SECTIONS, firmHref(), FirmPracticeSection, isFirmPracticeSection(), CalendarView (+17 more)

### Community 49 - "@playwright/test"
Cohesion: 0.07
Nodes (11): authenticatedReadRoutes, hasOwnerCredentials, login(), protectedApiRoutes, protectedPages, publicRoutes, hasAdmin, hasLawyer (+3 more)

### Community 50 - "env"
Cohesion: 0.14
Nodes (17): env, DATABASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_MFA_SECRET, E2E_ADMIN_PASSWORD, E2E_BASE_URL, E2E_LAWYER_EMAIL, E2E_OWNER_EMAIL (+9 more)

### Community 51 - "register/route.ts"
Cohesion: 0.15
Nodes (14): addDays(), prisma, seedMaqarMultiTenantPlatform(), daysFromNow(), db, db, E2E, isTestDatabase() (+6 more)

### Community 54 - "checkout/route.ts"
Cohesion: 0.24
Nodes (11): PLAN_PRICES_SAR, POST(), handleShareWhatsApp(), createMoyasarInvoice(), isMoyasarConfigured(), MoyasarInvoiceInput, MoyasarInvoiceResponse, buildFeeStatementWhatsAppMessage() (+3 more)

### Community 55 - "cn"
Cohesion: 0.08
Nodes (31): AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem() (+23 more)

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
Cohesion: 0.11
Nodes (16): addDays(), hashedPassword, main(), now, prisma, AcceptPrivacyPage(), ACCOUNT_OPTIONS, AccountType (+8 more)

### Community 60 - "class-variance-authority"
Cohesion: 0.20
Nodes (11): class-variance-authority@^0.7.1, class-variance-authority, Alert(), AlertDescription(), AlertTitle(), alertVariants, ToggleGroup(), ToggleGroupContext (+3 more)

### Community 62 - "app/layout.tsx"
Cohesion: 0.22
Nodes (9): cairo, metadata, plexArabic, RootLayout(), viewport, PWAInstallBanner(), ReactQueryProvider(), SessionProvider() (+1 more)

### Community 63 - "🇬🇧 English Summary"
Cohesion: 0.13
Nodes (14): Demo, Differentiation, 🇬🇧 English Summary, Problem, Solution, Stack, 📊 الأرقام, 🛠 التقنيات (+6 more)

### Community 64 - "ContractSummaryShowcase.tsx"
Cohesion: 0.24
Nodes (11): ContractSummaryShowcase(), FOCUS_OPTIONS, TAG_STYLES, summarize(), buildDeterministicContractSummary(), ClauseTag, ContractSummaryResult, ExtractionFocus (+3 more)

### Community 65 - "flows.spec.ts"
Cohesion: 0.14
Nodes (5): __dirname, eslintConfig, __filename, eslint-config-next@^16.4.6, eslint-config-next

### Community 66 - "InteractiveDemo.tsx"
Cohesion: 0.31
Nodes (8): InteractiveDemo(), PRESET_CLAUSES, PresetClause, presetToOutcome(), ClauseCheckResult, runDeterministicClauseRules(), ANALYTICS_EVENTS, trackEvent()

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
Cohesion: 0.10
Nodes (27): next-auth@^4.24.15, next-auth, DashboardPage(), authOptions, canAccessPortal(), homePathFor(), homePortalFor(), PORTAL_PATHS (+19 more)

### Community 75 - "db"
Cohesion: 0.18
Nodes (11): container_name, environment, image, ports, restart, security_opt, volumes, POSTGRES_DB (+3 more)

### Community 76 - "ts-sanad"
Cohesion: 0.18
Nodes (11): TS_AUTHKEY, TS_EXTRA_ARGS, TS_STATE_DIR, ts-sanad, container_name, environment, hostname, image (+3 more)

### Community 77 - "portal-links/route.ts"
Cohesion: 0.12
Nodes (24): GET(), POST(), POST(), canActOnCase(), POST(), DELETE(), parseStages(), PATCH() (+16 more)

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

### Community 84 - "portal-security.test.ts"
Cohesion: 0.24
Nodes (7): isReadOnlyRole(), MAX_UPLOAD_BYTES, getGlossaryExplanation(), GlossaryEntry, glossaryMap, translateToClientWording(), pdf

### Community 85 - "PortalShell.tsx"
Cohesion: 0.16
Nodes (25): CaseCard(), DraggableCase(), ClientCard(), InvoiceActions(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+17 more)

### Community 86 - "index.tsx"
Cohesion: 0.13
Nodes (16): CalendarEvent, COLOR_BADGE, COLOR_BORDER, COLOR_ICON, FilterKey, FILTERS, Props, TYPE_ICON (+8 more)

### Community 87 - "client-portal.ts"
Cohesion: 0.29
Nodes (7): ClientPage(), ClientAuthContext, getClientContext(), CLIENT_ACCOUNT_SESSION_LABEL, ClientPortalData, getClientPortalData(), hashPortalToken()

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
Cohesion: 0.21
Nodes (11): @prisma/client@^6.11.1, @prisma/client, vitest, MaqarRlsContext, withTenantRls(), ActiveTenantSession, assertCrossTenantBoundary(), assertValidTenantSession() (+3 more)

### Community 92 - "NotificationCenter.tsx"
Cohesion: 0.38
Nodes (7): AppNotification, formatRelativeTime(), getNotificationIcon(), NotificationCenter(), Popover(), PopoverContent(), PopoverTrigger()

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

### Community 101 - "cron/jobs/route.ts"
Cohesion: 0.33
Nodes (8): GET(), isAuthorized(), POST(), safeEqual(), backoffMinutes(), claimJob(), failJob(), processDueJobs()

### Community 103 - "client-portal-unified-view.tsx"
Cohesion: 0.08
Nodes (49): lucide-react, react, sonner, steps, ForgotPasswordPage(), AuthLocale, LoginPage(), safeCallbackUrl() (+41 more)

### Community 104 - "e2e"
Cohesion: 0.50
Nodes (4): name, runs-on, services, e2e

### Community 108 - "maqar-smoke-test.sh"
Cohesion: 0.90
Nodes (4): check_status(), fail(), pass(), maqar-smoke-test.sh script

### Community 123 - "codemod-sanad-to-maqar.mts"
Cohesion: 0.22
Nodes (5): typescript@^5, typescript, collectTsFiles(), MODULE_REWRITES, ROOTS

### Community 126 - "prune-imports.mjs"
Cohesion: 0.28
Nodes (6): formatImport(), prune(), require, ROOT, ts, usedIdentifiers()

### Community 132 - "مَقَرّ (Maqar)"
Cohesion: 0.09
Nodes (20): Code structure & conventions, Layout, Rules of thumb, Worked example: client portal (`src/app/portal/[token]`), Background jobs, Environment variables, Environments, File structure (+12 more)

### Community 133 - "seed_clients.ts"
Cohesion: 0.50
Nodes (3): daysFromNow(), db, main()

## Knowledge Gaps
- **2 isolated node(s):** `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 732 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `getAuthContext` to `notFoundJson`, `usePortalView`, `use-security-settings.ts`, `ClientsView.tsx`, `rateLimit`, `register/route.ts`, `dependencies`, `package.json`, `index.ts`, `caseLinkedAccessWhere`, `entitlements.ts`, `[token]/route.ts`, `FirmTeamPage.tsx`, `LandingHeader`, `react`, `signature/route.ts`, `use-admin.ts`, `PortalShell.tsx`, `lucide-react`, `LawyerSectionView.tsx`, `register/route.ts`, `robots.ts`, `sitemap.ts`, `checkout/route.ts`, `register/page.tsx`, `app/layout.tsx`, `next-auth`, `portal-links/route.ts`, `portal-security.test.ts`, `client-portal.ts`, `NotificationCenter.tsx`, `verify-email/route.ts`, `cron/jobs/route.ts`, `client-portal-unified-view.tsx`, `next.config.ts`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **What connects `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getAuthContext` be split into smaller, more focused modules?**
  _Cohesion score 0.08840970350404313 - nodes in this community are weakly interconnected._
- **Why does `react` connect `client-portal-unified-view.tsx` to `usePortalView`, `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `use-toast.ts`, `package.json`, `card.tsx`, `utils.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `react`, `app/workflow/page.tsx`, `use-admin.ts`, `PortalShell.tsx`, `use-deep-work.ts`, `context-menu.tsx`, `pagination.tsx`, `cn`, `menubar.tsx`, `register/page.tsx`, `class-variance-authority`, `app/layout.tsx`, `ContractSummaryShowcase.tsx`, `InteractiveDemo.tsx`, `carousel.tsx`, `chart.tsx`, `form.tsx`, `toast.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `PortalShell.tsx`, `index.tsx`, `NotificationCenter.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `ClientsView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10799251537022186 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `client-portal-unified-view.tsx` to `usePortalView`, `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `package.json`, `card.tsx`, `utils.ts`, `useLang`, `FirmTeamPage.tsx`, `LandingHeader`, `react`, `app/workflow/page.tsx`, `PortalShell.tsx`, `use-deep-work.ts`, `context-menu.tsx`, `lucide-react`, `pagination.tsx`, `cn`, `menubar.tsx`, `register/page.tsx`, `ContractSummaryShowcase.tsx`, `InteractiveDemo.tsx`, `carousel.tsx`, `toast.tsx`, `navigation-menu.tsx`, `PortalShell.tsx`, `index.tsx`, `NotificationCenter.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `rateLimit` be split into smaller, more focused modules?**
  _Cohesion score 0.11879432624113476 - nodes in this community are weakly interconnected._