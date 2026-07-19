# ArsemiaOS — Prioritized Backlog

Priorities follow dependency order + owner value + technical readiness.
Deep specs live in the two spec docs and the master pack — this file is
the ordering, not the design. See `ROADMAP.md` for the sprint sequence.

## Critical next

1. **Tickets / Assistance Center Foundation** — the central router for
   work that needs an owner. Queues (unassigned/overdue/urgent/waiting-X),
   types, priorities, links to jobs/claims/documents, escalation levels.
   Depends on the event spine (done). Unlocks COI flow, claim intake,
   foreman assistance. Spec: org spec §8/§39.
2. **Foremen Directory CRUD + Availability Rules** — replace the static
   `drivers` array with a store (add/edit/deactivate foremen, link
   workspace users, default truck as data), plus date-aware availability:
   time-off requests, approvals, recurring off-days, assignment-suggestion
   exclusion and conflict alerts. Spec: field-ops §46, org spec §44.
3. **Demo Reset / Import-Export tool** — see planning section below.
   Small, kills the biggest QA confusion source.

## Soon

4. **Documents / COI Request Flow** — `DocumentRequest` object, request →
   assigned → ready → sent lifecycle, documents queue, foreman sees status
   only. Routed through Tickets. Spec: org spec §9/§40.
5. **Claims Evidence + Deduction Review** — financial layers (customer
   settlement vs insurance vs company absorption vs proposed/approved
   deduction), responsibility evidence, "no deduction without evidence/
   approval" enforcement, traffic tickets as separate records. Spec: org
   spec §13/§43.
6. **Dashboard by Role** — "this is what you have to do today" per role;
   see planning section below.
7. **Payroll / Statements** — statements per foreman period, deduction
   hooks from claims, audit trail alignment with the master pack §6.
8. **Notification Center polish** — role-scoped notifications, read state,
   badge accuracy, link-through consistency.

## Later

9. **Communications Hub Foundation** — internal comms shell: mock
   call/SMS log, dispositions, links to lead/job/ticket/claim, missed-call
   queue. No real telephony. Spec: org spec §7/§38.
10. **AI Intake / Lead-to-Quote Draft** — inquiry → Lead → Quote Draft
    with mandatory human seller review before sending. Documented rule in
    `DECISIONS.md`; nothing built yet.
11. **Storage / Warehouse redesign** — master pack §7/§8: command center,
    scan sessions, custody timeline, labels/QR; warehouse-operator role.
12. **Foreman App v0** — mobile execution app per field-ops spec §51
    (today/tomorrow, accept/decline, checkpoints, Customer Signing Mode,
    photos, assistance, time-off). The web portal remains the placeholder
    until then.
13. **Role + Scope / Branch model** — `branchId` on records, Role+Scope
    permissions, branch owners, warehouse/documents/finance roles;
    includes the pricing-visibility audit. Big data-model cut — do it
    deliberately, in one sprint.
14. **Fleet capacity realism** — fleet data QA, truck↔foreman default
    consistency, maintenance-driven availability windows.

## Future / production

15. **Pricing Intelligence / Quote Audit Lab** — owner/admin-only
    simulator, margins, versioned pricing, approval flags. Spec: org spec
    §12/§42.
16. **Customer Move Link** — secure token link (no accounts), quote
    approval/signatures/status/payment link. Spec: org spec §10/§41.
17. **Data cleanup / naming debt** — `driver*` → `foreman*` rename,
    consolidate person identity (drivers / SEED_USERS / foreman-profiles
    into one registry), remove stale static roster fields, zone naming
    ("Long Distance" is not a geography).
18. **Backend / auth / integrations** — real persistence, real auth,
    VoIP/SMS/email, payments. Explicitly out of prototype scope.

---

## Demo Reset Planning (design only — NOT implemented)

Purpose: QA keeps tripping over stale persisted state; testers need a
clean, deliberate way to control demo data.

### Planned controls (Settings → Demo data)

- **Reset all demo data** — clear every `arsemia.*` store key, reload.
- **Reset only jobs** (`arsemia.jobs.v4`, `arsemia.preload-tasks.v1`,
  pending reassignments) — re-anchors dates, regenerates assignment mix.
- **Reset only leads/quotes** (`arsemia.leads.v1`, `arsemia.quotes.v1`,
  `arsemia.catalog-pending.v1`).
- **Reset only foremen/trucks** (`arsemia.fleet.v2`,
  `arsemia.foreman-availability.v1`, `arsemia.foreman-profiles.v1`).
- **Load empty company mode** — seedless stores: no jobs, no leads, no
  history; for "day one" demos and future onboarding testing.
- **Load realistic demo dataset** — the current sanitized Miami-style
  moving-company seed (never real customer/POC data).
- **Import / export demo dataset** — JSON download/upload of the
  `arsemia.*` keys, with version stamping so old exports are rejected or
  migrated explicitly.

### Rules

- Destructive actions require a typed confirmation ("RESET") and list
  exactly which stores will be cleared.
- Every reset writes ONE unified event (`demo_data_reset`, source
  `system`) — then clears; the fresh activity log seeds a note that a
  reset happened.
- Reset is owner-role only.
- Orphaned keys from old versions are cleaned up by "Reset all":
  `arsemia.jobs.v2`, `arsemia.jobs.v3`, `arsemia.job-events.v1`.

### Current active localStorage keys (inventory for the tool)

`arsemia.preferences.v3`, `arsemia.jobs.v4`, `arsemia.users.v1`,
`arsemia.activity-log.v1`, `arsemia.preload-tasks.v1`,
`arsemia.foreman-availability.v1`, `arsemia.foreman-profiles.v1`,
`arsemia.fleet.v2`, `arsemia.leads.v1`, `arsemia.quotes.v1`,
`arsemia.catalog-pending.v1`, `arsemia.claims.v2`, `arsemia.storage.v2`,
`arsemia.invoices.v1`, `arsemia.expenses.v2`, `arsemia.adjustments.v1`,
`arsemia.job-documents.v1`, `arsemia.notifications.v2`,
`arsemia.company-config.v1`, `arsemia.account.v1`.

### Backend migration considerations (later)

- The reset tool's store inventory doubles as the migration manifest.
- Import/export JSON is the natural seed format for a future API.
- Version stamps per store map to future schema migrations; the
  "tolerant reader" pattern from Sprint 3 is the template.

---

## Dashboard by Role Planning (design only — NOT implemented)

Principle: **"This is what you have to do today."** A dashboard is a
queue of decisions, not a poster of charts. Every tile must link to the
surface that fixes it (the Alerts pattern).

First-pass content per role:

- **Owner** — exceptions only: unassigned today/tomorrow, not-accepted
  count, declines, trucks in shop, overdue tickets (future), claims
  waiting (future), unpaid invoices, payroll exceptions. Everything
  click-through.
- **Dispatcher** — today's board digest: unassigned jobs, waiting-to-
  accept, declines with next action, update-not-sent, preload tasks,
  truck conflicts; one button to Operations → Assignments.
- **Seller** — new leads, follow-ups due/overdue, quotes awaiting
  customer, quotes needing approval (future), today's booked jobs.
- **Foreman** — the portal IS the dashboard: waiting-for-your-response,
  today/tomorrow accepted, preload tasks, (later) documents to sign and
  payroll summary.
- **Claims** — new claims, waiting evidence, waiting foreman/customer
  response, deduction reviews pending approval (future model).
- **Finance/Admin** — unpaid/overdue invoices, expenses to approve,
  payroll periods to close, deduction approvals (future).
- **Fleet** — trucks down / in shop, inspections due/failed, documents
  expiring, trucks idle vs assigned today.
- **Storage/Warehouse** — units at risk, pending storage-in/out, preload
  loads scheduled today, incidents (future scan model).
- **Marketing/CRM** — later; requires consent model and campaign data
  that do not exist yet.

Implementation note (for the future sprint): derive everything from the
existing stores/selectors — no new decorative metrics; reuse
`buildAssignmentDaySummary`, `buildForemanDayStatuses`, alerts logic.
