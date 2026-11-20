# Graph Report - sanad  (2026-11-15)

## Corpus Check
- 595 files · ~307,177 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, . 2, .example 1)

## Summary
- 3003 nodes · 10545 edges · 152 communities (119 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5c387c40`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getAuthContext
- unauthorizedJson
- dashboard/page.tsx
- use-security-settings.ts
- index.tsx
- ClientsView.tsx
- entitlements.ts
- rag-engine.ts
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
- Button
- index.ts
- ClientsView.tsx
- utils.ts
- caseLinkedAccessWhere
- re
- [token]/route.ts
- useLang
- app/workflow/page.tsx
- LandingHeader
- maqar-rag-pipeline.ts
- events.ts
- SolutionsPersonaView.tsx
- ReviewPanel.tsx
- سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل
- مَقَرّ (Maqar)
- codeql.yml
- use-admin.ts
- webhook/route.ts
- dashboard.ts
- FirmTeamPage.tsx
- esignature.ts
- compilerOptions
- app
- app/page.tsx
- ContractSummaryShowcase.tsx
- zatca.ts
- components.json
- devDependencies
- scripts
- LawyerSectionView.tsx
- @playwright/test
- env
- change/route.ts
- procedural-notifications.ts
- ExecutiveContractDashboard.tsx
- LitigationPleadingWorkbench.tsx
- menubar.tsx
- app
- env
- breadcrumb.tsx
- register/page.tsx
- StudentPortal.tsx
- AcademicResearchLabHub.tsx
- context-menu.tsx
- 🇬🇧 English Summary
- use-daily-brief.ts
- flows.spec.ts
- onboarding.ts
- carousel.tsx
- updates
- FirmPortalFrame.tsx
- chart.tsx
- with
- manifest.json
- form.tsx
- portals.ts
- db
- ts-sanad
- input-otp.tsx
- templates.ts
- drawer.tsx
- env-audit.ts
- navigation-menu.tsx
- validate
- services/billing.ts
- CaseCard.tsx
- pagination.tsx
- sandbox/page.tsx
- healthcheck
- options
- postgres
- @prisma/client
- health/route.ts
- uptime-kuma
- db
- dev.sh
- tailwindcss
- overrides
- services
- on
- FirmOnboardingPage
- command.tsx
- client-portal-unified-view.tsx
- e2e
- vitest
- @radix-ui/react-aspect-ratio
- semantic-rag.ts
- maqar-smoke-test.sh
- build.sh
- start.sh
- docker-entrypoint.sh
- bus.ts
- volumes
- FirmSettingsPage
- app/layout.tsx
- healthcheck
- emailjs
- embla-carousel-react
- @hookform/resolvers@^5.1.1
- CommandPalette.tsx
- scripts/seed.ts
- seed_student.ts
- codemod-sanad-to-maqar.mts
- accordion.tsx
- FirmPortalFrame
- prune-imports.mjs
- dashboard/admin/page.tsx
- dashboard/client/page.tsx
- postcss.config.mjs
- sw.js
- logError
- seed_clients.ts
- dashboard/firm/page.tsx
- dashboard/lawyer/page.tsx
- @dnd-kit/utilities@^3.2.2
- uqr
- docx
- @radix-ui/react-accordion
- @radix-ui/react-hover-card
- @radix-ui/react-navigation-menu
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-slider
- react-day-picker
- react-resizable-panels
- stripe
- vaul
- zustand@^5.0.6
- @radix-ui/react-tooltip

## God Nodes (most connected - your core abstractions)
1. `unauthorizedJson()` - 245 edges
2. `getAuthContext()` - 239 edges
3. `cn()` - 232 edges
4. `Button()` - 231 edges
5. `next` - 201 edges
6. `lucide-react` - 167 edges
7. `react` - 146 edges
8. `useLang()` - 145 edges
9. `Badge()` - 120 edges
10. `notFoundJson()` - 115 edges

## Surprising Connections (you probably didn't know these)
- `Security model (summary)` --references--> `client()`  [INFERRED]
  README.md → src/lib/email.ts
- `Background jobs` --references--> `ensureRecurringJobs()`  [INFERRED]
  README.md → src/lib/jobs.ts
- `createWorkspace()` --calls--> `hashPassword()`  [EXTRACTED]
  tests/workspace-isolation.test.ts → src/lib/auth/password.ts
- `seedMaqarMultiTenantPlatform()` --calls--> `hashPassword()`  [EXTRACTED]
  prisma/seed.ts → src/lib/auth/password.ts
- `runStatutoryIndexingPipeline()` --calls--> `chunkStatuteByArticles()`  [EXTRACTED]
  scripts/index-statutes.ts → src/lib/ai/maqar-rag-pipeline.ts

## Import Cycles
- None detected.

## Communities (152 total, 33 thin omitted)

### Community 0 - "getAuthContext"
Cohesion: 0.06
Nodes (64): GET(), GET(), PUT(), targetWorkspace(), GET(), GET(), ACTIONS, PATCH() (+56 more)

### Community 1 - "unauthorizedJson"
Cohesion: 0.09
Nodes (94): DECISIONS, PATCH(), POST(), GET(), DELETE(), PATCH(), GET(), POST() (+86 more)

### Community 2 - "dashboard/page.tsx"
Cohesion: 0.14
Nodes (24): CorporateDashboardPage(), MODULE_PORTAL_HREFS, CalendarView, CasesView, ClientsView, CommunicationsView, ComplianceView, DailyBriefView (+16 more)

### Community 3 - "use-security-settings.ts"
Cohesion: 0.16
Nodes (12): ChangePasswordSection(), DataPrivacySection(), MfaSection(), NotificationPreferencesSection(), SecurityHeader(), SecuritySettingsState, useSecuritySettings(), defaultPrefs() (+4 more)

### Community 4 - "index.tsx"
Cohesion: 0.18
Nodes (22): InvoicePreviewDialog(), InvoiceRow(), STATUS_COLORS, STATUS_FILTERS, StatTile(), InvoicesView(), Props, Table() (+14 more)

### Community 5 - "ClientsView.tsx"
Cohesion: 0.15
Nodes (64): AddCaseDialog(), ClientFormDialog(), CommandPalette(), AddComplianceDialog(), CATEGORIES, ConflictCheckModal(), DailyBriefHero(), AddDocDialog() (+56 more)

### Community 6 - "entitlements.ts"
Cohesion: 0.07
Nodes (57): nextConfig, next, PATCH(), patchSchema, ANALYSIS_TYPES, buildFallbackAnalysis(), POST(), StructuredAnalysis (+49 more)

### Community 7 - "rag-engine.ts"
Cohesion: 0.24
Nodes (17): ARABIC_STOP_WORDS, calculateNgramSimilarity(), extractLegalCitations(), getCharNgrams(), normalizeArabic(), stripTashkeel(), tokenizeArabic(), chunkStatuteByArticles() (+9 more)

### Community 8 - "core/types.ts"
Cohesion: 0.04
Nodes (75): @dnd-kit/core, COMM_TYPE_META, DIRECTION_META, INVOICE_STATUS_COLORS, STAGE_COLORS, OverviewTab(), InfoRow(), TimeTabProps (+67 more)

### Community 9 - "CoursesPanel"
Cohesion: 0.60
Nodes (4): CoursesPanel(), Collapsible(), CollapsibleContent(), CollapsibleTrigger()

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, date-fns@^4.1.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, file-saver@^2.0.5, framer-motion@^12.23.2, input-otp@^1.4.2, lucide-react@^0.525.0 (+41 more)

### Community 11 - "cn"
Cohesion: 0.07
Nodes (53): Avatar(), AvatarFallback(), AvatarImage(), CardAction(), CardFooter(), RadioGroup(), RadioGroupItem(), SelectLabel() (+45 more)

### Community 12 - "environment"
Cohesion: 0.13
Nodes (15): environment, AUDIT_LOG_HMAC_SECRET, BACKUP_ENCRYPTION_KEY, CRON_SECRET, DATABASE_URL, DOCUMENT_SIGNATURE_KEY, ESIGNATURE_SIGNING_SECRET, FILE_ENCRYPTION_KEY (+7 more)

### Community 13 - "app/layout.tsx"
Cohesion: 0.13
Nodes (24): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+16 more)

### Community 14 - "package.json"
Cohesion: 0.05
Nodes (41): clsx@^2.1.1, cmdk@^1.1.1, @mdxeditor/editor@^3.39.1, @radix-ui/react-collapsible@^1.1.11, @radix-ui/react-context-menu@^2.2.15, @radix-ui/react-dropdown-menu@^2.1.15, @radix-ui/react-label@^2.1.7, @radix-ui/react-popover@^1.1.14 (+33 more)

### Community 15 - "entitlements.ts"
Cohesion: 0.12
Nodes (21): GET(), FirmHome(), runRetentionSweep(), SOFT_DELETABLE, ACTIVE_SUBSCRIPTION_STATUSES, betaAiDailyLimit(), currentDay(), currentPeriod() (+13 more)

### Community 16 - "prisma-tenant-extension.ts"
Cohesion: 0.13
Nodes (18): assertNoCrossTenantMutationFields(), assertValidScopeContext(), assertWorkspacePresent(), buildTenantFilter(), BULK_WRITE_OPS, createAsyncContextTenantPrisma(), createTenantIsolationExtension(), createTenantScopedPrisma() (+10 more)

### Community 17 - "split-module.mjs"
Cohesion: 0.09
Nodes (18): cfg, importTexts, mainHeader, mainParts, mainReexports, outputs, reexports, require (+10 more)

### Community 18 - "Button"
Cohesion: 0.08
Nodes (38): lucide-react, react, sonner, AcademyDashboardPage(), steps, ForgotPasswordPage(), AuthLocale, AuthMethod (+30 more)

### Community 19 - "index.ts"
Cohesion: 0.07
Nodes (39): GET(), GET(), GET(), GET(), GET(), GET(), paginatedResponse(), parsePagination() (+31 more)

### Community 20 - "ClientsView.tsx"
Cohesion: 0.30
Nodes (18): CaseCard(), CLIENT_TYPES, ClientCard(), ClientsView(), FormState, InvoiceActions(), AlertDialog(), AlertDialogAction() (+10 more)

### Community 21 - "utils.ts"
Cohesion: 0.09
Nodes (18): class-variance-authority@^0.7.1, class-variance-authority, Alert(), AlertDescription(), AlertTitle(), alertVariants, Calendar(), CalendarDayButton() (+10 more)

### Community 22 - "caseLinkedAccessWhere"
Cohesion: 0.12
Nodes (29): GET(), GET(), GET(), GET(), GET(), GET(), POST(), secretsMatch() (+21 more)

### Community 23 - "re"
Cohesion: 0.15
Nodes (13): build_imports(), import_symbols(), main(), parse(), rewrite_mod(), used(), dedent(), imports_for() (+5 more)

### Community 24 - "[token]/route.ts"
Cohesion: 0.09
Nodes (45): POST(), runtime, GET(), runtime, GET(), POST(), runtime, GET() (+37 more)

### Community 25 - "useLang"
Cohesion: 0.07
Nodes (82): ClientDashboard(), HomeTab(), SessionsTab(), AiSearchChat(), ChatItem, CitedSource, READY_PROMPTS_AR, CalendarEvent (+74 more)

### Community 26 - "app/workflow/page.tsx"
Cohesion: 0.09
Nodes (16): FirmWorkflowPage(), LawyerWorkflowPage(), Approval, Assignment, Client, EmptyState(), Member, PortalRequest (+8 more)

### Community 27 - "LandingHeader"
Cohesion: 0.19
Nodes (16): AboutPage(), metadata, AiDisclosurePage(), metadata, ApiDocs(), LandingFooter(), LandingHeader(), NAV_ITEMS (+8 more)

### Community 28 - "maqar-rag-pipeline.ts"
Cohesion: 0.13
Nodes (22): prisma, runStatutoryIndexingPipeline(), legalQueryRequestSchema, POST(), buildMaqarGroundedPrompt(), computeBm25Scores(), cosineSimilarity(), DEFAULT_SAUDI_STATUTORY_DOCUMENTS (+14 more)

### Community 29 - "events.ts"
Cohesion: 0.18
Nodes (17): AlertDeliveredEvent, AnalyticsEvent, AnalyticsEventBase, AnalyticsEventInput, AnalyticsEventName, ClauseCheckCompletedEvent, ClauseCheckStartedEvent, DistributiveOmit (+9 more)

### Community 30 - "SolutionsPersonaView.tsx"
Cohesion: 0.18
Nodes (12): AcademySolutionsPage(), metadata, FeatureCardSpec, PersonaSolutionConfig, PersonaSolutionKey, SolutionsPersonaView(), EnterpriseSolutionsPage(), metadata (+4 more)

### Community 31 - "ReviewPanel.tsx"
Cohesion: 0.13
Nodes (19): Props, Props, FlashcardView(), ModeCard(), Props, ReviewCard, ReviewDeck, ReviewPanel() (+11 more)

### Community 32 - "سند (Sanad) — خارطة طريق المنتج ومسار تجربة بوابة العميل"
Cohesion: 0.09
Nodes (21): Product Roadmap & Client Portal UX Specification, الشاشة الأولى: شاشة التحقق الآمن (Secure Entry & OTP Verification), الشاشة الثالثة: مسار الخط الزمني القضائي (Visual Case Journey), الشاشة الثانية: اللوحة الرئيسية للموكل (Client Mobile-First Dashboard), الشاشة الخامسة: مراجعة المستندات والتوقيع الإلكتروني (E-Signature & Approval), الشاشة الرابعة: الفواتير والسداد الإلكتروني (ZATCA Invoices & Instant Checkout), 📌 المرحلة الأولى: تعزيز التحويل وتأمين قيمة المحامي الأساسية (Sprint 1 - 2), 📌 المرحلة الثالثة: مسارات الطلاب والتدريب المهني (Sprint 5 - 6) (+13 more)

### Community 33 - "مَقَرّ (Maqar)"
Cohesion: 0.09
Nodes (20): Code structure & conventions, Layout, Rules of thumb, Worked example: client portal (`src/app/portal/[token]`), Background jobs, Environment variables, Environments, File structure (+12 more)

### Community 34 - "codeql.yml"
Cohesion: 0.10
Nodes (20): runs-on, steps, timeout-minutes, jobs, analyze, name, on, pull_request (+12 more)

### Community 35 - "use-admin.ts"
Cohesion: 0.19
Nodes (11): AdminHeader(), AdminNotice(), AdminStatusSection(), Card(), Status, AdminState, useAdmin(), updatePrivacyRequest() (+3 more)

### Community 36 - "webhook/route.ts"
Cohesion: 0.53
Nodes (5): claimEvent(), POST(), processEvent(), runtime, subscriptionIdFromInvoice()

### Community 37 - "dashboard.ts"
Cohesion: 0.29
Nodes (8): emptyDashboard(), getLawyerDashboard(), legalWorkspace(), GET(), filterTaskStats(), TaskLike, Workspace, MockTask

### Community 38 - "FirmTeamPage.tsx"
Cohesion: 0.24
Nodes (15): FirmAssignments(), FirmAssignmentsPage(), FirmOverviewPage(), FirmTeamPage(), INVITE_ROLES, FirmLoading(), Panel(), ROLE_LABELS (+7 more)

### Community 39 - "esignature.ts"
Cohesion: 0.18
Nodes (16): buildSignerOrder(), computeDeviceFingerprint(), dispatchContractForSignature(), emitSignatureAuditTrail(), ESignatureDispatchRequest, ESignatureEnvelope, getSigningSecret(), issueSignatureCertificate() (+8 more)

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 41 - "app"
Cohesion: 0.17
Nodes (12): cap_drop, container_name, depends_on, extra_hosts, image, ports, restart, security_opt (+4 more)

### Community 42 - "app/page.tsx"
Cohesion: 0.17
Nodes (13): CoveredStatutesSection(), KNOWLEDGE_PILLARS, KnowledgePillar, PillarIcon(), PillarId, FinalCta(), HeroSection(), PILLAR_PROPOSITIONS (+5 more)

### Community 43 - "ContractSummaryShowcase.tsx"
Cohesion: 0.14
Nodes (19): ContractSummaryShowcase(), FOCUS_OPTIONS, TAG_STYLES, InteractiveDemo(), PRESET_CLAUSES, PresetClause, presetToOutcome(), summarize() (+11 more)

### Community 44 - "zatca.ts"
Cohesion: 0.21
Nodes (17): calculateInvoiceHash(), chunksToBase64(), generateUblXml(), generateZatcaPhase2Qr(), generateZatcaQr(), getTlvChunk(), isValidSaudiVatNumber(), processZatcaPhase2() (+9 more)

### Community 45 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 46 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @axe-core/playwright@^4.13.0, bun-types@^1.3.4, eslint@^9, @tailwindcss/postcss@^4, tw-animate-css@^1.3.5, @types/file-saver@^2.0.7, @types/react@^19 (+12 more)

### Community 47 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, build, db:generate, db:migrate, db:push, db:reset, db:seed, debug (+15 more)

### Community 48 - "LawyerSectionView.tsx"
Cohesion: 0.09
Nodes (35): FirmSectionView(), dynamicParams, FirmSectionPage(), FIRM_PRACTICE_SECTIONS, firmHref(), FirmPracticeSection, isFirmPracticeSection(), CommandPalette (+27 more)

### Community 49 - "@playwright/test"
Cohesion: 0.07
Nodes (11): authenticatedReadRoutes, hasOwnerCredentials, login(), protectedApiRoutes, protectedPages, publicRoutes, hasAdmin, hasLawyer (+3 more)

### Community 50 - "env"
Cohesion: 0.14
Nodes (17): env, DATABASE_URL, E2E_ADMIN_EMAIL, E2E_ADMIN_MFA_SECRET, E2E_ADMIN_PASSWORD, E2E_BASE_URL, E2E_LAWYER_EMAIL, E2E_OWNER_EMAIL (+9 more)

### Community 51 - "change/route.ts"
Cohesion: 0.14
Nodes (23): otplib, db, E2E, isTestDatabase(), main(), POST(), POST(), POST() (+15 more)

### Community 52 - "procedural-notifications.ts"
Cohesion: 0.22
Nodes (12): AppealAlertWindow, classifyAppealDeadlineWindow(), classifyHearingAlertWindow(), composeArabicProceduralAlert(), dispatchMultiChannelProceduralAlert(), HearingAlertWindow, NotificationChannel, ProceduralAlertPayload (+4 more)

### Community 53 - "ExecutiveContractDashboard.tsx"
Cohesion: 0.11
Nodes (22): analyzePayloadSchema, POST(), ClmPortfolioContract, ExecutiveContractDashboard(), ORDERED_PIPELINE_STAGES, SAMPLE_CLM_PORTFOLIO, useClauseAnalyzer(), useClmStateMachine() (+14 more)

### Community 54 - "LitigationPleadingWorkbench.tsx"
Cohesion: 0.11
Nodes (27): addDays(), prisma, seedMaqarMultiTenantPlatform(), briefExportSchema, POST(), calculateSchema, EVENTS, isSafeOutboundWebhookUrl() (+19 more)

### Community 55 - "menubar.tsx"
Cohesion: 0.12
Nodes (12): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarPortal(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 56 - "app"
Cohesion: 0.12
Nodes (16): build, cap_drop, container_name, depends_on, environment, extra_hosts, image, ports (+8 more)

### Community 57 - "env"
Cohesion: 0.12
Nodes (13): docker-deploy.sh script, cleanup(), ping_backup_monitor(), backup-db.sh script, maqar-cache-purge-rebuild.sh script, run_cmd(), maqar-emergency-rollback.sh script, cleanup() (+5 more)

### Community 58 - "breadcrumb.tsx"
Cohesion: 0.20
Nodes (8): @radix-ui/react-slot@^1.2.3, @radix-ui/react-slot, BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 59 - "register/page.tsx"
Cohesion: 0.14
Nodes (13): addDays(), hashedPassword, main(), now, prisma, AcceptPrivacyPage(), ACCOUNT_OPTIONS, AccountType (+5 more)

### Community 60 - "StudentPortal.tsx"
Cohesion: 0.18
Nodes (13): emptyStudentDashboard(), getStudentDashboard(), metadata, StudentLayout(), StudentHomePage(), StudentPortalFrame(), StudentTabPage(), TAB_TITLES (+5 more)

### Community 61 - "AcademicResearchLabHub.tsx"
Cohesion: 0.18
Nodes (10): zod@^4.0.2, zod, evaluateSchema, POST(), DRAFTING_SIMULATION_SCENARIOS, DraftingEvaluationResult, evaluateStudentDraftingSubmission(), LEGAL_TERMINOLOGY_MARKERS (+2 more)

### Community 62 - "context-menu.tsx"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 63 - "🇬🇧 English Summary"
Cohesion: 0.13
Nodes (14): Demo, Differentiation, 🇬🇧 English Summary, Problem, Solution, Stack, 📊 الأرقام, 🛠 التقنيات (+6 more)

### Community 64 - "use-daily-brief.ts"
Cohesion: 0.30
Nodes (10): DailyBriefModeSelector(), CATEGORY_MAP, DailyBriefItem, NEWSLETTER_ISSUES, NewsletterIssue, LiveFeedSection(), NewsletterIssuesSection(), DailyBriefState (+2 more)

### Community 65 - "flows.spec.ts"
Cohesion: 0.14
Nodes (5): __dirname, eslintConfig, __filename, eslint-config-next@^16.4.0, eslint-config-next

### Community 66 - "onboarding.ts"
Cohesion: 0.12
Nodes (20): completeMaqarOnboarding(), corporateOnboardingSchema, deriveRoleConfiguration(), lawFirmOnboardingSchema, MaqarOnboardingInput, maqarOnboardingInputSchema, MaqarOnboardingResult, slugifyEntity() (+12 more)

### Community 67 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 68 - "updates"
Cohesion: 0.15
Nodes (12): dependency-type, development-dependencies, production-dependencies, dependency-type, interval, updates, directory, groups (+4 more)

### Community 69 - "FirmPortalFrame.tsx"
Cohesion: 0.13
Nodes (18): ACTIVE_STAGES_EXCLUDED, FirmCaseRow, FirmDashboard, FirmMember, getFirmDashboard(), Props, MobileNav(), MobileNavProps (+10 more)

### Community 70 - "chart.tsx"
Cohesion: 0.22
Nodes (12): recharts@^2.15.4, recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle() (+4 more)

### Community 71 - "with"
Cohesion: 0.21
Nodes (12): steps, if, name, run, uses, with, steps, cache (+4 more)

### Community 72 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, description, dir, display, icons, lang, name, orientation (+3 more)

### Community 73 - "form.tsx"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 74 - "portals.ts"
Cohesion: 0.11
Nodes (29): canAccessMaqarDashboard(), canAccessPortal(), homePathFor(), homePortalFor(), isReadOnlyRole(), maqarPersonaForDashboardPath(), MaqarRoutingContext, PORTAL_ROLES (+21 more)

### Community 75 - "db"
Cohesion: 0.18
Nodes (11): container_name, environment, image, ports, restart, security_opt, volumes, POSTGRES_DB (+3 more)

### Community 76 - "ts-sanad"
Cohesion: 0.18
Nodes (11): TS_AUTHKEY, TS_EXTRA_ARGS, TS_STATE_DIR, ts-sanad, container_name, environment, hostname, image (+3 more)

### Community 77 - "input-otp.tsx"
Cohesion: 0.40
Nodes (3): InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 78 - "templates.ts"
Cohesion: 0.14
Nodes (10): evaluateSafeguards(), GLOBAL_SAFEGUARDS, TEMPLATES, ContractType, DocumentCategory, DocumentTemplate, PleadingType, RegulatorySafeguard (+2 more)

### Community 79 - "drawer.tsx"
Cohesion: 0.22
Nodes (7): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerPortal(), DrawerTitle()

### Community 80 - "env-audit.ts"
Cohesion: 0.15
Nodes (8): auditMaqarEnvironment(), EnvAuditIssue, EnvAuditResult, EnvModuleCategory, EnvVarSpec, MAQAR_ENV_SPECS, collectCodebaseEnvUsages(), ROOT_DIR

### Community 81 - "navigation-menu.tsx"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 83 - "validate"
Cohesion: 0.22
Nodes (8): jobs, validate, name, permissions, contents, name, runs-on, services

### Community 84 - "services/billing.ts"
Cohesion: 0.17
Nodes (14): BillingLineItemInput, ComputedBillingLineItem, decodeZatcaTlvQrCode(), encodeSingleTlvField(), encodeZatcaTlvQrCode(), escapeXml(), GenerateZatcaInvoiceInput, generateZatcaPhase2Invoice() (+6 more)

### Community 85 - "CaseCard.tsx"
Cohesion: 0.05
Nodes (66): next-auth@^4.24.15, framer-motion, next-auth, next-themes, ClientPortalFrame(), sections, ClientLayout(), metadata (+58 more)

### Community 86 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 87 - "sandbox/page.tsx"
Cohesion: 0.33
Nodes (7): SandboxBanner(), SandboxBody(), SandboxFooter(), SandboxHeader(), SandboxState, useSandbox(), SandboxPage()

### Community 88 - "healthcheck"
Cohesion: 0.50
Nodes (8): healthcheck, healthcheck, interval, retries, start_period, test, timeout, healthcheck

### Community 89 - "options"
Cohesion: 0.36
Nodes (8): logging, logging, driver, options, max-file, max-size, logging, logging

### Community 90 - "postgres"
Cohesion: 0.25
Nodes (8): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, env, image, options, ports, postgres

### Community 91 - "@prisma/client"
Cohesion: 0.11
Nodes (26): @prisma/client@^6.11.1, @prisma/client, MaqarRlsContext, withTenantRls(), buildChainedAuditRecord(), ChainedAuditEnvelope, computeAuditChainHash(), GENESIS_AUDIT_CHAIN_HASH (+18 more)

### Community 92 - "health/route.ts"
Cohesion: 0.16
Nodes (14): AiState, dynamic, GET(), probeAi(), probeQueue(), probeVectorStore(), QueueHealth, VectorStoreHealth (+6 more)

### Community 93 - "uptime-kuma"
Cohesion: 0.29
Nodes (7): uptime-kuma, container_name, image, ports, restart, security_opt, volumes

### Community 95 - "db"
Cohesion: 0.18
Nodes (11): container_name, environment, image, ports, restart, security_opt, volumes, POSTGRES_DB (+3 more)

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

### Community 101 - "FirmOnboardingPage"
Cohesion: 0.70
Nodes (5): FirmOnboardingPage(), complete(), inviteMember(), mutate(), saveIdentity()

### Community 102 - "command.tsx"
Cohesion: 0.22
Nodes (7): Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut()

### Community 103 - "client-portal-unified-view.tsx"
Cohesion: 0.06
Nodes (43): ConsentLayer(), ClientPortalUnifiedView(), BottomNav(), DataDeletionModal(), DocumentReviewModal(), ExpiredScreen(), GlossaryModal(), MessagesTab() (+35 more)

### Community 104 - "e2e"
Cohesion: 0.50
Nodes (4): name, runs-on, services, e2e

### Community 105 - "vitest"
Cohesion: 0.09
Nodes (15): vitest, getAcademicInstitutionName(), INSTITUTION_NAMES, isAcademicEmail(), SAUDI_ACADEMIC_DOMAINS, ComplianceStatusCheck, evaluateComplianceStatus(), SAUDI_STANDARD_CLAUSES (+7 more)

### Community 107 - "semantic-rag.ts"
Cohesion: 0.18
Nodes (12): POST(), semanticSearchSchema, AUTHORITATIVE_LEGAL_CORPUS, computeLegalEmbeddingVector(), cosineSimilarity(), GroundedLegalCorpusDocument, GroundedSemanticSearchResponse, runGroundedSemanticLegalSearch() (+4 more)

### Community 108 - "maqar-smoke-test.sh"
Cohesion: 0.90
Nodes (4): check_status(), fail(), pass(), maqar-smoke-test.sh script

### Community 112 - "bus.ts"
Cohesion: 0.33
Nodes (8): DEFAULT_CHANNELS, deliverToChannel(), NotificationChannel, NotificationPayload, publishNotification(), sendEmailNotification(), sendSmsNotification(), sendWhatsAppNotification()

### Community 113 - "volumes"
Cohesion: 0.29
Nodes (6): name, services, volumes, staging-backups, staging-postgres, staging-uploads

### Community 115 - "app/layout.tsx"
Cohesion: 0.19
Nodes (10): cairo, metadata, plexArabic, RootLayout(), viewport, BeforeInstallPromptEvent, PWAInstallBanner(), ReactQueryProvider() (+2 more)

### Community 116 - "healthcheck"
Cohesion: 0.53
Nodes (6): healthcheck, healthcheck, interval, retries, test, timeout

### Community 120 - "CommandPalette.tsx"
Cohesion: 0.33
Nodes (5): CommandAction, Props, SearchResult, TYPE_COLORS, TYPE_ICONS

### Community 121 - "scripts/seed.ts"
Cohesion: 0.50
Nodes (3): daysFromNow(), db, main()

### Community 122 - "seed_student.ts"
Cohesion: 0.50
Nodes (3): daysFromNow(), db, main()

### Community 123 - "codemod-sanad-to-maqar.mts"
Cohesion: 0.20
Nodes (5): collectTsFiles(), MODULE_REWRITES, ROOTS, PERSONA_SOLUTIONS, ROOT_DIR

### Community 124 - "accordion.tsx"
Cohesion: 0.40
Nodes (3): AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 125 - "FirmPortalFrame"
Cohesion: 0.67
Nodes (3): FirmPortalFrame(), FirmLayout(), metadata

### Community 126 - "prune-imports.mjs"
Cohesion: 0.22
Nodes (8): typescript@^5, typescript, formatImport(), prune(), require, ROOT, ts, usedIdentifiers()

### Community 132 - "logError"
Cohesion: 0.07
Nodes (56): POST(), POST(), POST(), ACCOUNT_TYPES, AccountType, getClientIp(), POST(), recordPrivacyAcceptance() (+48 more)

### Community 133 - "seed_clients.ts"
Cohesion: 0.50
Nodes (3): daysFromNow(), db, main()

## Knowledge Gaps
- **2 isolated node(s):** `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 860 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `entitlements.ts` to `getAuthContext`, `unauthorizedJson`, `dashboard/client/page.tsx`, `dashboard/page.tsx`, `logError`, `use-security-settings.ts`, `dashboard/firm/page.tsx`, `dashboard/lawyer/page.tsx`, `ClientsView.tsx`, `dependencies`, `package.json`, `entitlements.ts`, `Button`, `index.ts`, `caseLinkedAccessWhere`, `[token]/route.ts`, `LandingHeader`, `maqar-rag-pipeline.ts`, `SolutionsPersonaView.tsx`, `use-admin.ts`, `webhook/route.ts`, `dashboard.ts`, `FirmTeamPage.tsx`, `app/page.tsx`, `LawyerSectionView.tsx`, `change/route.ts`, `ExecutiveContractDashboard.tsx`, `LitigationPleadingWorkbench.tsx`, `register/page.tsx`, `StudentPortal.tsx`, `AcademicResearchLabHub.tsx`, `onboarding.ts`, `portals.ts`, `CaseCard.tsx`, `sandbox/page.tsx`, `health/route.ts`, `client-portal-unified-view.tsx`, `semantic-rag.ts`, `app/layout.tsx`, `FirmPortalFrame`, `dashboard/admin/page.tsx`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **What connects `NEXT_TELEMETRY_DISABLED`, `FILE_ENCRYPTION_KEY` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getAuthContext` be split into smaller, more focused modules?**
  _Cohesion score 0.057345360824742266 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Button` to `dashboard/page.tsx`, `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `app/layout.tsx`, `package.json`, `ClientsView.tsx`, `utils.ts`, `useLang`, `app/workflow/page.tsx`, `LandingHeader`, `ReviewPanel.tsx`, `use-admin.ts`, `FirmTeamPage.tsx`, `app/page.tsx`, `ContractSummaryShowcase.tsx`, `LawyerSectionView.tsx`, `ExecutiveContractDashboard.tsx`, `LitigationPleadingWorkbench.tsx`, `menubar.tsx`, `breadcrumb.tsx`, `register/page.tsx`, `StudentPortal.tsx`, `context-menu.tsx`, `use-daily-brief.ts`, `onboarding.ts`, `carousel.tsx`, `FirmPortalFrame.tsx`, `chart.tsx`, `form.tsx`, `input-otp.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `CaseCard.tsx`, `pagination.tsx`, `sandbox/page.tsx`, `command.tsx`, `client-portal-unified-view.tsx`, `app/layout.tsx`, `CommandPalette.tsx`, `accordion.tsx`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Should `unauthorizedJson` be split into smaller, more focused modules?**
  _Cohesion score 0.08743927827897294 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Button` to `dashboard/page.tsx`, `use-security-settings.ts`, `index.tsx`, `ClientsView.tsx`, `core/types.ts`, `dependencies`, `cn`, `app/layout.tsx`, `package.json`, `ClientsView.tsx`, `utils.ts`, `useLang`, `app/workflow/page.tsx`, `LandingHeader`, `SolutionsPersonaView.tsx`, `ReviewPanel.tsx`, `FirmTeamPage.tsx`, `app/page.tsx`, `ContractSummaryShowcase.tsx`, `LawyerSectionView.tsx`, `ExecutiveContractDashboard.tsx`, `LitigationPleadingWorkbench.tsx`, `menubar.tsx`, `breadcrumb.tsx`, `register/page.tsx`, `StudentPortal.tsx`, `context-menu.tsx`, `use-daily-brief.ts`, `onboarding.ts`, `carousel.tsx`, `FirmPortalFrame.tsx`, `input-otp.tsx`, `navigation-menu.tsx`, `CaseCard.tsx`, `pagination.tsx`, `sandbox/page.tsx`, `command.tsx`, `client-portal-unified-view.tsx`, `app/layout.tsx`, `CommandPalette.tsx`, `accordion.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13756613756613756 - nodes in this community are weakly interconnected._