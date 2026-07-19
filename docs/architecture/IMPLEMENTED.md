# ArsemiaOS — Implemented Map

Honest state of the app as of Sprint 3 + QA patches (branch
`claude/funny-mayer-wkp9ue`). Statuses:

- **Solid** — behaves as designed, covered by smoke tests, safe to build on.
- **Partial** — works but incomplete against the specs.
- **Placeholder** — exists to hold the space; honest about being temporary.
- **Needs QA** — built earlier, not exercised by recent sprints/smoke.
- **Deprecated/avoid** — superseded; do not build on it.

Update this file at the end of every sprint.

## Dashboard (`/`)
- Owner-style overview reading live stores (jobs, leads, expenses,
  invoices, claims) — **Partial** (same view for every role; see
  Dashboard-by-Role plan in `BACKLOG.md`).

## Sales / Pipeline (`/pipeline`, `/leads`)
- Leads store + table + detail, follow-up states, seller assignment —
  **Needs QA** (predates Sprint 2.2; activity logging present).
- Pipeline board page — **Needs QA**.

## Quotes (`/quotes`)
- Quote builder + calculator engine + item text parser + pending catalog
  approvals + print view — **Needs QA** (rich, but untouched since early
  sprints).

## Customers (`/customers`)
- List + detail from seed data — **Partial** (no CRM depth, no consent
  model).

## Operations (`/operations`)
- Three-tab shell (Board / Assignments / Alerts), shared date, legacy tab
  fallbacks, `?focus=` deep links — **Solid**.
- Dispatch Board: date-scoped queue/chips, operational-first job cards,
  crew panel from shared selector, honest simulated map + empty state —
  **Solid** (map markers are static demo scenery — known limitation).
- Alerts: derived-only, clickable to fixing surface, acceptance wording —
  **Solid**.

## Assignments (Daily Dispatch Control Board)
- Day Plan header (counts + Send day plan), unassigned cards, foreman
  lanes with lifecycle chips + next actions, decline panel — **Solid**.
- Assignment lifecycle: Draft → Sent to app → Accepted by foreman /
  Declined (reason) / Dispatch override (reason, distinct) / Update not
  sent / Update sent; store-enforced, event-emitting — **Solid**.
- Default truck: auto-apply when usable, summary-first UI, override
  picker, explicit block reasons — **Solid**.
- Same-day move flow with pre-move warnings; ReassignModal/pending
  reassignments routed through the same lifecycle — **Solid**.
- Warehouse preload tasks: seeded, on lanes + bench cards + portal,
  Mark loaded / Skip with timeline events — **Partial** (manual seed; no
  automation; no full warehouse model).

## Foremen / Contractors (`/foremen`)
- Roster derived from live jobs via `buildForemanDayStatuses`, 13 status
  filters with matching counts, sectioned cards, directory tab —
  **Solid**.
- Underlying roster data: static `drivers` array in `mock-data.ts`
  (no CRUD, one workspace-user link, stale static fields like
  `currentJobId`) — **Partial**, and the static `status`/`eta`/location
  fields are **Deprecated/avoid** as truth.
- Availability: manual 3-state override, not date-aware — **Partial**
  (rules/time-off are specced, not built).

## Fleet (`/fleet`)
- Vehicle store with capacity overrides, maintenance/inspection records,
  detail pages — **Needs QA** (pre-2.2; capacity helpers are Solid and
  used everywhere).

## Jobs (`/jobs`)
- Day/week/list views, shared month-capable DateNavigator, live-store
  source of truth in all views, foreman self-scoping — **Solid**.
- Job Detail: header/lifecycle strip/addresses/inventory/services/notes/
  confirmations/connections panels — **Partial** (rich but pre-2.2 in
  places); foreman read-only field view + own-jobs guard — **Solid**.
- Adjustments flow (request → review → apply) — **Needs QA** (event
  wiring updated in Sprint 3; the flow itself predates it).
- Documents panel (generate/send/sign-as/void/print, role-gated) —
  **Partial**.

## Timeline / Event System
- Unified `activity-log` store, `logEvent()` API, `EventContext`,
  linkedType/linkedId, tolerant legacy readers, store-emitted assignment
  events, Job Detail Timeline card, history drawer — **Solid**.
- `/activity` page (owner-only, module filters) — **Solid** (renders
  unified events via title fallback).

## Foreman Portal (`/foreman-portal`)
- Identity header, Waiting-for-response vs Upcoming-accepted, Accept/
  Decline with reason, preload tasks, unlinked-user state, honest
  coming-soon placeholder — **Solid** (as the sanctioned temporary web
  portal; the mobile app is future).

## Claims (`/claims`)
- Claims store, list/detail, storage-damage link — **Needs QA**
  (predates the specs; no financial layers / deduction review /
  responsibility model yet).

## Finance (`/finance`: invoices, expenses, payroll)
- Invoices + print, expenses (foreman-scoped view), payroll pages with
  contractor/crew percent models, payroll tools — **Needs QA** (rich but
  untouched for many sprints; payroll demo seeds exist).

## Storage (`/storage`)
- Providers/units/items store, chain-of-custody basics, unit detail,
  damage→claim link — **Partial / Needs QA** (master-pack Storage OS,
  scan sessions, pallets not built).

## Reports (`/reports`)
- Thin wrapper around the legacy analytics page — **Placeholder**
  (charts predate the "no decorative modules" rule; treat numbers with
  suspicion).

## Settings (`/settings`)
- Users & Access (invite/remove, role capabilities with overrides,
  photoUrl in store), calculator/pricing config, theme — **Partial**
  (no photo upload UI; single foreman↔user link).

## Activity (`/activity`)
- See Timeline section — **Solid**.

## Notifications (bell + `/notifications`)
- Local notification store + bell + page — **Partial** (badge/center
  polish and role scoping pending).

## Cross-cutting
- `UserAvatar` identity component — **Solid**.
- Shared `DateNavigator` (strip + month view) — **Solid**.
- Shared day-status selectors (`day-status.ts`) — **Solid**.
- Capability-based RouteGuard (deny-by-default) — **Partial** (no
  branch scope; foreman gaps closed for job detail only where audited).
- Demo seeds: date-anchored jobs v4, preload tasks, payroll demo —
  **Solid** for dispatch flows; older seeds (leads/quotes/claims)
  **Needs QA**.

## Known orphaned localStorage keys (for the future reset tool)
`arsemia.jobs.v2`, `arsemia.jobs.v3` (superseded by `v4`),
`arsemia.job-events.v1` (retired store, read-only tolerant reader).
Active keys are listed in `BACKLOG.md` → Demo Reset Planning.
