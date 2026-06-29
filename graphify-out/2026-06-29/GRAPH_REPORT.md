# Graph Report - .  (2026-06-29)

## Corpus Check
- 213 files · ~471,635 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1211 nodes · 2630 edges · 99 communities (86 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 69,870 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Scanner & Client Capture|Scanner & Client Capture]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Legal Terms & Layout|Legal Terms & Layout]]
- [[_COMMUNITY_UI Sheet & Overlays|UI: Sheet & Overlays]]
- [[_COMMUNITY_UI Avatar & Dialog|UI: Avatar & Dialog]]
- [[_COMMUNITY_Dashboard Server Actions|Dashboard Server Actions]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Calendar & Screens|Calendar & Screens]]
- [[_COMMUNITY_Case Detail & AI|Case Detail & AI]]
- [[_COMMUNITY_Preview & AI Search|Preview & AI Search]]
- [[_COMMUNITY_UI Accordion & Hover|UI: Accordion & Hover]]
- [[_COMMUNITY_Communications & Compliance|Communications & Compliance]]
- [[_COMMUNITY_Student Review System|Student Review System]]
- [[_COMMUNITY_API Route Handlers|API Route Handlers]]
- [[_COMMUNITY_Student Panels & Brief|Student Panels & Brief]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Arabic RTL & Deep Work|Arabic RTL & Deep Work]]
- [[_COMMUNITY_Socket.IO Server|Socket.IO Server]]
- [[_COMMUNITY_View Card Components|View Card Components]]
- [[_COMMUNITY_Deployment Options|Deployment Options]]
- [[_COMMUNITY_shadcn UI Config|shadcn UI Config]]
- [[_COMMUNITY_UI Menubar|UI: Menubar]]
- [[_COMMUNITY_Seed Case Data|Seed: Case Data]]
- [[_COMMUNITY_UI Context Menu|UI: Context Menu]]
- [[_COMMUNITY_Brief & Student Overview|Brief & Student Overview]]
- [[_COMMUNITY_Cluster 25|Cluster 25]]
- [[_COMMUNITY_Cluster 26|Cluster 26]]
- [[_COMMUNITY_Cluster 27|Cluster 27]]
- [[_COMMUNITY_Cluster 28|Cluster 28]]
- [[_COMMUNITY_Cluster 29|Cluster 29]]
- [[_COMMUNITY_Cluster 30|Cluster 30]]
- [[_COMMUNITY_Cluster 31|Cluster 31]]
- [[_COMMUNITY_Cluster 32|Cluster 32]]
- [[_COMMUNITY_Cluster 33|Cluster 33]]
- [[_COMMUNITY_Cluster 34|Cluster 34]]
- [[_COMMUNITY_Cluster 35|Cluster 35]]
- [[_COMMUNITY_Cluster 36|Cluster 36]]
- [[_COMMUNITY_Cluster 37|Cluster 37]]
- [[_COMMUNITY_Cluster 38|Cluster 38]]
- [[_COMMUNITY_Cluster 39|Cluster 39]]
- [[_COMMUNITY_Cluster 40|Cluster 40]]
- [[_COMMUNITY_Cluster 41|Cluster 41]]
- [[_COMMUNITY_Cluster 42|Cluster 42]]
- [[_COMMUNITY_Cluster 43|Cluster 43]]
- [[_COMMUNITY_Cluster 44|Cluster 44]]
- [[_COMMUNITY_Cluster 45|Cluster 45]]
- [[_COMMUNITY_Cluster 46|Cluster 46]]
- [[_COMMUNITY_Cluster 47|Cluster 47]]
- [[_COMMUNITY_Cluster 48|Cluster 48]]
- [[_COMMUNITY_Cluster 49|Cluster 49]]
- [[_COMMUNITY_Cluster 50|Cluster 50]]
- [[_COMMUNITY_Cluster 51|Cluster 51]]
- [[_COMMUNITY_Cluster 52|Cluster 52]]
- [[_COMMUNITY_Cluster 53|Cluster 53]]
- [[_COMMUNITY_Cluster 54|Cluster 54]]
- [[_COMMUNITY_Cluster 55|Cluster 55]]
- [[_COMMUNITY_Cluster 56|Cluster 56]]
- [[_COMMUNITY_Cluster 57|Cluster 57]]
- [[_COMMUNITY_Cluster 59|Cluster 59]]
- [[_COMMUNITY_Cluster 60|Cluster 60]]
- [[_COMMUNITY_Cluster 61|Cluster 61]]
- [[_COMMUNITY_Cluster 62|Cluster 62]]
- [[_COMMUNITY_Cluster 85|Cluster 85]]
- [[_COMMUNITY_Cluster 86|Cluster 86]]
- [[_COMMUNITY_Cluster 87|Cluster 87]]
- [[_COMMUNITY_Cluster 88|Cluster 88]]
- [[_COMMUNITY_Cluster 89|Cluster 89]]
- [[_COMMUNITY_Cluster 90|Cluster 90]]
- [[_COMMUNITY_Cluster 91|Cluster 91]]
- [[_COMMUNITY_Cluster 92|Cluster 92]]
- [[_COMMUNITY_Cluster 97|Cluster 97]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 226 edges
2. `useLang()` - 85 edges
3. `Button()` - 30 edges
4. `Sanad Sidebar Navigation` - 25 edges
5. `formatDate()` - 24 edges
6. `Card()` - 23 edges
7. `CardContent()` - 23 edges
8. `Badge()` - 21 edges
9. `Input()` - 19 edges
10. `daysUntil()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Sanad Sidebar Navigation` --NAVIGATES_TO--> `CasesView Component`  [EXTRACTED]
  download/sanad-ar-compliance.png → src/components/sanad/CasesView.tsx
- `StudentView` --serves_role--> `Student Role (طالب)`  [EXTRACTED]
  src/components/sanad/StudentView.tsx → download/sanad-review-setup.png
- `Student Role (طالب)` ----> `StudentView`  [EXTRACTED]
  download/sanad-review-summary.png → src/components/sanad/StudentView.tsx
- `StudentView` ----> `Sanad PWA`  [EXTRACTED]
  src/components/sanad/StudentView.tsx → download/sanad-review-summary.png
- `Case Detail Drawer Screenshot` --depicts--> `CaseDetailDrawer Component`  [EXTRACTED]
  download/sanad-case-detail-drawer.png → src/components/sanad/CaseDetailDrawer.tsx

## Import Cycles
- 1-file cycle: `src/components/ui/sonner.tsx -> src/components/ui/sonner.tsx`
- 1-file cycle: `src/components/ui/input-otp.tsx -> src/components/ui/input-otp.tsx`

## Communities (99 total, 13 thin omitted)

### Community 0 - "Scanner & Client Capture"
Cohesion: 0.06
Nodes (90): Camera Capture (تشغيل الكاميرا), Camera Integration, Clients View (العملاء), Document Upload from Device, Message, User, OCR Document Scanning Feature, OCR Text Extraction (+82 more)

### Community 1 - "NPM Dependencies"
Cohesion: 0.03
Nodes (69): dependencies, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (+61 more)

### Community 2 - "Legal Terms & Layout"
Cohesion: 0.06
Nodes (40): Legal Term Card Design, Terms Bank Panel (بنك المصطلحات), geistMono, geistSans, metadata, plexArabic, viewport, ReactQueryProvider() (+32 more)

### Community 3 - "UI: Sheet & Overlays"
Cohesion: 0.05
Nodes (41): Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+33 more)

### Community 4 - "UI: Avatar & Dialog"
Cohesion: 0.07
Nodes (38): AlertDialogOverlay(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+30 more)

### Community 5 - "Dashboard Server Actions"
Cohesion: 0.06
Nodes (38): getLawyerDashboard(), getStudentDashboard(), Home(), Persona, View, AddCaseDialog(), CasesView(), KanbanColumn() (+30 more)

### Community 6 - "Build Configuration"
Cohesion: 0.07
Nodes (29): devDependencies, bun-types, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/file-saver (+21 more)

### Community 7 - "Calendar & Screens"
Cohesion: 0.14
Nodes (26): Calendar Event Summary Stats Bar, Calendar Time Filter Tabs, Sanad Invoices Screen (Screenshot), Sanad Scanner Full Screenshot, Document Scanner Navigation Entry, Invoice Financial KPI Cards, Invoice List Table, Invoices View (الفواتير) (+18 more)

### Community 8 - "Case Detail & AI"
Cohesion: 0.09
Nodes (18): Client Card Component, AiInsightsTab(), CaseDetail, CaseDetailDrawer(), COMM_TYPE_META, CommsTab(), DIRECTION_META, DocumentsTab() (+10 more)

### Community 9 - "Preview & AI Search"
Cohesion: 0.10
Nodes (22): Sanad Preview Screenshot, Sanad Daily Operations / Today View, Lawyer / Student Role Switch, AiSearchChat(), Props, DashboardView(), Props, Props (+14 more)

### Community 10 - "UI: Accordion & Hover"
Cohesion: 0.09
Nodes (9): AccordionContent(), AccordionItem(), AccordionTrigger(), HoverCardContent(), PopoverContent(), ResizableHandle(), ResizablePanelGroup(), Slider() (+1 more)

### Community 11 - "Communications & Compliance"
Cohesion: 0.12
Nodes (19): Add Communication Action (تسجيل اتصال), Billable Time Tracking, Communication Entry Card, Communications Log View, Compliance Expiry Tracking, Focus Timer, Lawyer-Client CRM Feature, Role Switcher (طالب / محامي) (+11 more)

### Community 12 - "Student Review System"
Cohesion: 0.10
Nodes (13): Smart Review Flashcard Feature, Student Mode (طالب), Review Session Complete Screen, FlashcardView(), QuizView(), ReviewCard, ReviewDeck, ReviewSession (+5 more)

### Community 14 - "Student Panels & Brief"
Cohesion: 0.13
Nodes (16): Daily Legal Digest Widget, CasebookPanel(), CoursesPanel(), DeadlinesPanel(), TermsPanel(), OverviewPanel(), Props, StudentView() (+8 more)

### Community 15 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 16 - "Arabic RTL & Deep Work"
Cohesion: 0.15
Nodes (16): Arabic RTL UI Design, Billable Hours Tracker, Deep Work View, Sanad Scanner View Screenshot, Sanad Navigation Sidebar, Pomodoro Timer, PWA Feature, RTL Arabic UI Design (+8 more)

### Community 17 - "Socket.IO Server"
Cohesion: 0.12
Nodes (9): createSystemMessage(), createUserMessage(), generateMessageId(), httpServer, io, Message, User, users (+1 more)

### Community 18 - "View Card Components"
Cohesion: 0.18
Nodes (19): EventCard(), OverviewTab(), CaseCard(), ComplianceCard(), DeepWorkView(), CreateInvoiceDialog(), InvoiceCard(), InvoicePreviewDialog() (+11 more)

### Community 19 - "Deployment Options"
Cohesion: 0.14
Nodes (18): Caddy Reverse Proxy, Cases Kanban Board, Compliance Tracker, Direct Bun Deployment, PM2 Deployment, Systemd Deployment, Sanad File Structure, Lawyer UI Audit Report (+10 more)

### Community 20 - "shadcn UI Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 21 - "UI: Menubar"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 22 - "Seed: Case Data"
Cohesion: 0.18
Nodes (16): Case Card: Al Suleiman Inheritance #218, Case Card: Brightsaoud Trademark, Case Card: Al-Faisaliah Contract Dispute, Case Card: Gulf Pharmacies Acquisition, Case Card: Gulf Tech Employment Policy, Case Card: Labor Dispute (Saoud Al-Mutairi), Case Card: TECO Confidentiality Agreement Review, Case Deadline Urgency Indicator (+8 more)

### Community 23 - "UI: Context Menu"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 24 - "Brief & Student Overview"
Cohesion: 0.23
Nodes (14): Daily Legal Brief, Lecture Notes Status Workflow, Student Morning Overview Tab, Terms Mastery Progress System, Sanad Student Overview Screenshot, Sanad PWA, Student Role (طالب), Smart Review Session Completion Screen (+6 more)

### Community 25 - "Cluster 25"
Cohesion: 0.24
Nodes (10): POST(), simulateLegalAnalysis(), POST(), simulateDraft(), POST(), simulateCardGeneration(), POST(), prisma (+2 more)

### Community 26 - "Cluster 26"
Cohesion: 0.23
Nodes (12): Bilingual Arabic/English UI, Case Board Module, Compliance Module, Daily Brief Feature, Dashboard View, Deep Work Module, Documents Module, Hijri Calendar Display (+4 more)

### Community 27 - "Cluster 27"
Cohesion: 0.25
Nodes (13): Billing & Time Tracking (concept), Compliance Tracking & Countdown, Daily Brief News Feed (concept), Daily Digest News Feed, Deep Work / Focus Timer (concept), Focus & Billing Time Tracking, Dual Calendar Support (concept), PWA Design Pattern (concept) (+5 more)

### Community 28 - "Cluster 28"
Cohesion: 0.21
Nodes (12): Sanad Student Deadlines Screenshot, Lecture Note Status Workflow, Cases Bank Feature (بنك القضايا), Legal Case Card UI Pattern, Sanad Student Dashboard (صباح الطالب), src/app/page.tsx, src/components/sanad/CommunicationsView.tsx, CasebookPanel (+4 more)

### Community 29 - "Cluster 29"
Cohesion: 0.21
Nodes (10): Props, MobileNav(), MobileNavProps, Sidebar(), SidebarProps, Props, TodayFocusView(), NAV_ICONS (+2 more)

### Community 30 - "Cluster 30"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 31 - "Cluster 31"
Cohesion: 0.27
Nodes (13): Sanad Lawyer Interface Audit, Calendar / Session Appointments (التقويم / مواعيد الجلسات), Cases Kanban Board (لوحة القضايا), Client Management / CRM (إدارة العملاء), Communications Log (سجل الاتصالات), Compliance Tracker (متتبع الامتثال), Conflict of Interest Check (فحص تضارب المصالح), Deep Work & Billing (العمل العميق والفوترة) (+5 more)

### Community 32 - "Cluster 32"
Cohesion: 0.18
Nodes (10): buttonVariants, Calendar(), CalendarDayButton(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps (+2 more)

### Community 33 - "Cluster 33"
Cohesion: 0.17
Nodes (11): background_color, description, dir, display, icons, lang, name, orientation (+3 more)

### Community 34 - "Cluster 34"
Cohesion: 0.17
Nodes (11): CalendarEvent, CalendarView(), COLOR_BADGE, COLOR_BORDER, COLOR_ICON, DateHeader(), FilterKey, FILTERS (+3 more)

### Community 35 - "Cluster 35"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 36 - "Cluster 36"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 37 - "Cluster 37"
Cohesion: 0.45
Nodes (11): Sanad Persona-Fit Matrix, Feature: Billing & Work Hours (الفوترة وساعات العمل), Feature: Case & Client Management (إدارة القضايا والعملاء), Feature: Compliance & Renewal Tracking (تتبع الامتثال والتجديدات), Feature: Daily System Summary (الموجز اليومي للأنظمة), Feature: Document & Contract Management (إدارة المستندات والعقود), Persona: General Public / Citizen, Persona: Law Student (+3 more)

### Community 38 - "Cluster 38"
Cohesion: 0.22
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 39 - "Cluster 39"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 40 - "Cluster 40"
Cohesion: 0.38
Nodes (10): Billable Time Tracker, Compliance Expiry Tracker, Daily Brief Panel, Dashboard View (Concept), Sanad Dashboard Screenshot, Focus Timer KPI, Today's Priorities Panel, PWA Capabilities (+2 more)

### Community 41 - "Cluster 41"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 42 - "Cluster 42"
Cohesion: 0.31
Nodes (8): Case Entity / Data Model, Case Detail Drawer UI Pattern, Case Workflow Stages, CasesView / Case Board, Case Detail Drawer Screenshot, PWA / Home-Server Design, CaseDetailDrawer Component, CasesView Component

### Community 43 - "Cluster 43"
Cohesion: 0.29
Nodes (7): Flashcard Review Mode (بطاقات), Quiz Review Mode (اختبار), Recent Review Sessions History, Review Session Statistics, Review Source Filter, Smart Review Feature (المراجعة الذكية), Student Morning View (صباح الطالب)

### Community 44 - "Cluster 44"
Cohesion: 0.43
Nodes (5): Compliance Item Categories, Compliance Tracker View (متتبع الامتثال), Compliance Urgency Colour Coding, Arabic RTL UI Design, Sanad PWA Support

### Community 45 - "Cluster 45"
Cohesion: 0.38
Nodes (6): Cases Bank - Student (بنك القضايا), Flashcard Review Mode, Quiz Review Mode, Smart Review Feature, Student Role (طالب), Terms Bank (بنك المصطلحات)

### Community 46 - "Cluster 46"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 47 - "Cluster 47"
Cohesion: 0.57
Nodes (5): log_step_end(), log_step_start(), dev.sh script, start_mini_services(), wait_for_service()

### Community 48 - "Cluster 48"
Cohesion: 0.40
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 49 - "Cluster 49"
Cohesion: 0.33
Nodes (6): Props, Props, Props, AcademicDeadline, Course, Lecture

### Community 50 - "Cluster 50"
Cohesion: 0.60
Nodes (4): App Icon / Manifest Icon, CSS Breathe Animation, Sanad Brand Identity, Z-Mark Logo Design

### Community 51 - "Cluster 51"
Cohesion: 0.60
Nodes (3): err(), log(), deploy.sh script

### Community 52 - "Cluster 52"
Cohesion: 0.70
Nodes (4): Sanad Dark Theme, Sanad Sidebar Navigation Structure, Sanad PWA Capability, Sanad Tasks View

### Community 53 - "Cluster 53"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 54 - "Cluster 54"
Cohesion: 0.50
Nodes (3): __dirname, eslintConfig, __filename

### Community 55 - "Cluster 55"
Cohesion: 0.67
Nodes (3): daysFromNow(), db, main()

### Community 56 - "Cluster 56"
Cohesion: 0.67
Nodes (3): daysFromNow(), db, main()

### Community 57 - "Cluster 57"
Cohesion: 0.67
Nodes (3): daysFromNow(), db, main()

### Community 60 - "Cluster 60"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Agent Rule, Graphify Workflow

## Knowledge Gaps
- **308 isolated node(s):** `build.sh script`, `NEXT_TELEMETRY_DISABLED`, `start.sh script`, `$schema`, `style` (+303 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI: Avatar & Dialog` to `Scanner & Client Capture`, `Cluster 32`, `Legal Terms & Layout`, `Cluster 35`, `Cluster 36`, `UI: Sheet & Overlays`, `Cluster 38`, `Cluster 39`, `Cluster 41`, `UI: Accordion & Hover`, `Student Review System`, `Student Panels & Brief`, `Cluster 46`, `Cluster 48`, `Cluster 53`, `UI: Menubar`, `UI: Context Menu`, `Cluster 30`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Why does `dependencies` connect `NPM Dependencies` to `Cluster 48`, `Build Configuration`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Why does `sonner` connect `NPM Dependencies` to `Scanner & Client Capture`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `build.sh script`, `NEXT_TELEMETRY_DISABLED`, `start.sh script` to the rest of the system?**
  _308 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Scanner & Client Capture` be split into smaller, more focused modules?**
  _Cohesion score 0.06075568913696865 - nodes in this community are weakly interconnected._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.028985507246376812 - nodes in this community are weakly interconnected._
- **Should `Legal Terms & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._