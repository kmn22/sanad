# سند (Sanad)

**منصة العمليات القانونية للمحامين وطلاب القانون في السعودية**
*Legal operations platform for Saudi lawyers and law students*

> 🟢 **Live:** https://sanad.tail963524.ts.net
> 🔑 Create an account at `/register`

---

## What is Sanad?

Sanad is a multi-tenant SaaS that unifies a Saudi law office's day:

- 📋 **Cases & Compliance** — Kanban board, hearing dates, expiry tracking, confidential-matter isolation
- 👥 **Team workflow** — Owner-issued invitations, role-based access (owner / lawyer / staff / auditor / student / client), case assignments, approval chains, workflow templates
- 🧾 **Invoicing** — VAT-compliant invoice drafting linked to billable hours; paid invoices are immutable
- 🔗 **Client portal** — Hashed, expiring, revocable links; clients upload files and track requests
- 🤖 **Local AI** — Document analysis & drafting via Ollama; no data leaves the machine
- 🔐 **Security** — NextAuth credentials + TOTP MFA, session revocation, encrypted file storage (AES-256-GCM), workspace isolation, audit log, PDPL data-subject workflows, legal holds & retention policies
- � **SaaS foundation** — Plans, trials, seat limits, usage metrics, feature flags, signature-verified idempotent Stripe webhook
- 📱 **PWA** — Installable, partial offline support

## Tech

`Next.js 16` · `TypeScript` · `Prisma + PostgreSQL 16` · `NextAuth 4` · `Tailwind + shadcn/ui` · `Recharts` · `Ollama` · `Stripe` · `Docker Compose` · `Tailscale Funnel` · `Uptime Kuma`

## Screenshots

> _Add screenshots in `download/` — see `PITCH.md` for the recommended shot list._

---

## Quick Start (Docker — recommended)

```bash
# 1. Clone
git clone <your-repo-url> sanad && cd sanad

# 2. Configure environment
cp .env.example .env
# Set: NEXTAUTH_SECRET, POSTGRES_PASSWORD, NEXTAUTH_URL, CRON_SECRET,
#      FILE_ENCRYPTION_KEY, MFA_ENCRYPTION_KEY, BACKUP_ENCRYPTION_KEY

# 3. Start the stack (app + postgres; migrations run automatically)
docker compose up -d --build

# 4. Verify
curl http://localhost:3001/api/health
```

## Local Development (without Docker)

```bash
npm install
cp .env.example .env            # point DATABASE_URL at a PostgreSQL instance
npx prisma migrate deploy
npm run dev                     # http://localhost:3001
```

Demo seed (local databases only — refuses production and remote DBs):

```bash
SANAD_ALLOW_DESTRUCTIVE_SEED=1 npm run seed   # wipes and reseeds demo data
```

---

## Environments

| Environment | Compose file | Port | Database |
|---|---|---|---|
| Production | `docker-compose.yml` | 3001 | `sanad` (volume `sanad_postgres`) |
| Staging | `docker-compose.staging.yml` | 3101 | `sanad_staging`, exposed on `127.0.0.1:55432` |

**Staging is a separate compose project** (`sanad-staging`) — never run it under the
default project or it replaces production containers.

```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d
DATABASE_URL=postgresql://<user>:<pass>@127.0.0.1:55432/sanad_staging npx prisma migrate deploy
npx tsx scripts/seed_e2e.ts
```

## Production deploy

`./docker-deploy.sh` performs the safe rollout: safety `pg_dump` backup → clean-tree
check → `git pull` → `prisma migrate deploy` → rebuild → health gate. Production also
runs scheduled encrypted backups to `../sanad_backups` (`scripts/backup-db.sh`,
AES-256-GCM + SHA-256 manifest).

Monitoring: Uptime Kuma at `http://localhost:3002`. Health endpoint: `/api/health`.

---

## Testing

```bash
npm run typecheck        # TypeScript
npm run lint             # ESLint
npm test                 # vitest unit + isolation suites
npm run build            # production build

# Browser E2E (Playwright) against staging or production:
#   E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD enable authenticated suites.
docker run --rm --network host -v "$PWD:/work" -w /work \
  -e E2E_BASE_URL=http://127.0.0.1:3101 \
  -e E2E_OWNER_EMAIL=... -e E2E_OWNER_PASSWORD=... \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  npx playwright test
```

Suites: `e2e/smoke.spec.ts` (public/API gates), `e2e/auth.spec.ts` (sign-in),
`e2e/flows.spec.ts` (invitation→register→login, client portal upload, approval
chain, MFA enforcement), `e2e/a11y.spec.ts` (axe WCAG 2.1 AA).

CI runs the full chain on every push: Postgres service → migrations → seed →
build → standalone server → Playwright + axe. See `.github/workflows/ci.yml`.

## Background jobs

The Next.js instrumentation hook (`src/instrumentation.ts`) runs an in-process
scheduler that drains `BackgroundJob` rows (email, notification fan-out,
reminder sweeps, retention sweeps). Recurring jobs re-enqueue themselves via
`ensureRecurringJobs()`. `CRON_SECRET` still protects the `/api/cron/*` HTTP
triggers for external schedulers.

## Security model (summary)

- **Workspace isolation** — every tenant-scoped query filters `workspaceId`; JWT
  re-reads membership role, session version, disabled flag, and workspace status
  per request.
- **Capabilities** (`src/lib/auth/capabilities.ts`) — `admin`/`workspace_owner`
  manage; `lawyer`/`staff` write operational data; `auditor` read-only;
  `student` academic entities only; `client` is fenced to `/api/client/*` by the
  proxy plus per-route checks.
- **Confidential cases** — `LegalCase.confidential` hides a matter and all
  linked documents, tasks, communications, time entries, and invoices from
  anyone except owners/admins and actively-assigned members.
- **Deletion** — core entities soft-delete (`deletedAt`); every delete checks
  `LegalHold`; `retention.sweep` hard-purges soft-deleted rows past each
  workspace's `RetentionPolicy` and prunes expired rate-limit/auth tokens.
- **Mutations** — global body-size cap in the proxy, per-user mutation budgets,
  DB-backed atomic rate limiting, zod validation.
- **Financial controls** — paid invoices are immutable and non-deletable;
  invoice numbers are unique per workspace; amounts stored as `Decimal`.

## Environment variables

See `.env.example` (production) and `.env.staging.example`. Required:
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `POSTGRES_*`, `CRON_SECRET`,
`FILE_ENCRYPTION_KEY`, `MFA_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY`.
Optional: `STRIPE_*`, SMTP (`EMAIL_*`/`SMTP_*`), `OLLAMA_*`, `UPLOAD_ROOT`,
`NAJIZ_WEBHOOK_SECRET`, `ENABLE_DEMO_ZATCA`.

## SaaS readiness

Plans, trials, seat limits, usage metrics, and feature flags are workspace-scoped
and enforced via `src/lib/saas/entitlements.ts`. `GET /api/saas/status` exposes
plan + usage. Billing is scaffolded honestly:

- `POST /api/billing/checkout` — Stripe Checkout session (owner only); `503
  STRIPE_NOT_CONFIGURED` until `STRIPE_SECRET_KEY` + a `stripePriceId` on the
  plan exist.
- `POST /api/billing/portal` — Stripe Billing Portal session; `409` before any
  billing customer exists.
- `POST /api/billing/webhook` — signature-verified, idempotent; links
  `checkout.session.completed` and mirrors subscription status changes.

**Not yet production-complete:** live Stripe/ZATCA credentials, qualified
e-signatures, OTP delivery, and upload malware scanning — all currently fail
closed (`503`) rather than simulating success. Treat Sanad as a verified
operations alpha until these providers are integrated and legally validated.

## File structure

```
sanad/
├── src/
│   ├── app/                # App Router pages + ~100 API routes
│   ├── components/         # ui (shadcn) + sanad feature views
│   ├── lib/                # auth/, saas/, billing, jobs, retention, portal…
│   ├── instrumentation.ts  # in-process job scheduler
│   └── proxy.ts            # page/API gating, body cap, security headers
├── prisma/                 # schema + committed migrations
├── e2e/                    # Playwright suites
├── tests/                  # vitest unit/isolation
├── scripts/                # seeds, backups
├── Dockerfile              # standalone Next build + pinned prisma CLI
├── docker-entrypoint.sh    # migrate deploy → node server.js
├── docker-compose*.yml     # production + staging stacks
└── docker-deploy.sh        # safe production rollout (backup → migrate → gate)
```

## License

Private project. All rights reserved.
