# ArsemiaOS — Roadmap (next sprints in order)

One narrow sprint at a time. Each sprint ends with tsc/lint/build/smoke,
manual QA, a QA patch if needed, and an `IMPLEMENTED.md` update. Deep
designs live in the specs; this file is the order and the reasons.

## Sprint 3.5 — Project Map / Backlog / Demo Reset Planning *(this sprint)*
- **Goal:** documentation control layer (README/IMPLEMENTED/BACKLOG/
  ROADMAP/DECISIONS), demo-reset and dashboard planning.
- **Why now:** QA improved faster than the paperwork; the next sprints
  need a stable map to stay non-chaotic.
- **Unlocks:** every sprint below starts from a shared, honest state.
- **Out of scope:** any app behavior change.

## Sprint 4 — Tickets / Assistance Center Foundation
- **Goal:** Tickets workspace + store: types, queues (unassigned/overdue/
  urgent/waiting-X), priority, ownership, links to job/claim/document,
  escalation levels, timeline events per transition; manual creation +
  creation from Job Detail; portal "assistance" creates a ticket.
- **Why this order:** both specs name it the first module after the event
  spine; COI, claims intake, and communications all route through it.
- **Unlocks:** COI flow (Sprint 6), claim intake, comms routing, owner
  exception dashboard.
- **Out of scope:** Communications Hub, real notifications, COI documents
  themselves, claims financials, branch scope.

## Sprint 5 — Foremen Directory CRUD + Availability Rules
- **Goal:** foremen become a store (add/edit/deactivate, workspace-user
  link, default truck as data), date-aware availability: time-off
  requests (portal) + approval queue (dispatch), recurring off-days,
  assignment suggestions exclude unavailable foremen, conflict alerts
  for already-assigned off days.
- **Why this order:** Assignments is trustworthy but sits on a static
  roster; availability is the biggest remaining dispatch lie. Approval
  queue reuses Tickets patterns from Sprint 4.
- **Unlocks:** honest suggestions, LD travel blocks later, Foreman App
  time-off, person-registry consolidation.
- **Out of scope:** full `driver*` rename, branch scope, performance
  ratings, fatigue scoring.

## Sprint 6 — Demo Reset / Import-Export Tool *(small sprint)*
- **Goal:** Settings → Demo data per `BACKLOG.md` planning: reset all /
  per-domain resets / empty company / reload demo / JSON import-export,
  typed confirmation, owner-only, orphaned-key cleanup.
- **Why this order:** cheap, and every following sprint's QA gets faster
  and more reproducible. After Foremen CRUD so the reset covers the new
  store shapes.
- **Unlocks:** clean QA baselines, onboarding demos, backend seed format.
- **Out of scope:** backend sync, multi-dataset library.

## Sprint 7 — Documents / COI Request Flow
- **Goal:** `DocumentRequest` model + documents queue; COI ticket type
  routes to it; request → in-progress → ready → sent (simulated) with
  timeline logging; attach to Job Documents; foreman sees status only.
- **Why this order:** highest-pain field request; needs Tickets (4) and
  benefits from reset (6) for QA.
- **Unlocks:** documents queue on dashboards, building/property-manager
  workflows, claim document types later.
- **Out of scope:** real sending, template designer, e-signatures beyond
  the existing demo sign-as.

## Sprint 8 — Claims Evidence + Responsibility Foundation
- **Goal:** claim financial layers (settlement / insurance / company /
  proposed vs approved deduction), deduction-review status with owner
  approval, evidence requirements, responsibility notes, traffic tickets
  as separate records; claims queue.
- **Why this order:** policy is settled in `DECISIONS.md`; needs events
  (done) + tickets (4); payroll (9) consumes its approved deductions.
- **Unlocks:** payroll deduction hooks, claims dashboard, foreman
  claim-response requests in the portal.
- **Out of scope:** insurance integrations, customer-facing claim portal.

## Sprint 9 — Payroll / Statements Foundation
- **Goal:** per-foreman period statements aligned to master pack §6,
  approved-deduction hooks from claims, audit trail via unified events,
  statement print view.
- **Why this order:** consumes Sprint 8's approved deductions; finance
  pages exist but need the statement backbone.
- **Out of scope:** real payments, tax logic, contractor invoicing.

## Sprint 10 — Dashboard by Role
- **Goal:** per-role "what you have to do today" dashboards per the
  planning section in `BACKLOG.md`, derived from existing selectors and
  the new queues (tickets/documents/claims/payroll).
- **Why this order:** dashboards aggregate queues — building them after
  the queues exist keeps them honest, not decorative.
- **Out of scope:** custom widgets, analytics charts.

## Sprint 11 — Communications Hub Foundation
- **Goal:** internal comms shell: mock call/SMS log with dispositions,
  linking to lead/job/ticket/claim/invoice, missed-call/callback queues,
  "log a call" quick action that can create/update tickets.
- **Why this order:** routing target (Tickets) and surfaces (dashboards)
  now exist; still no real telephony.
- **Out of scope:** VoIP/SMS integrations, recordings, transcripts.

## Sprint 12 — AI Intake / Lead-to-Quote Draft
- **Goal:** intake surface (simulated website/assistant input) creating
  Leads and Quote Drafts flagged "AI draft — seller review required";
  seller approval gate before any quote is "sent".
- **Why this order:** depends on the settled human-review rule and a
  healthy sales flow QA'd via reset tooling.
- **Out of scope:** real AI integration, real channels — the gate and
  data flow are the deliverable.

## Sprint 13 — Storage / Warehouse Redesign (phase 1)
- **Goal:** master pack §7 first slice: storage command center, scan
  sessions + custody timeline on the event spine, warehouse-operator
  role's minimal surfaces; preload tasks graduate toward real warehouse
  ops.
- **Out of scope:** pallets/trailer manifests ($7/mile stays documented
  only), label printing hardware.

## Sprint 14 — Foreman App v0
- **Goal:** field-ops spec §51 v0: today/tomorrow, accept/decline, job
  detail, checkpoints, basic photos, assistance → tickets, time-off →
  availability; web portal retires to a pointer.
- **Why this order:** every dependency (acceptance semantics, tickets,
  availability, documents status, events) is now real.
- **Out of scope:** scanning/pallets (v1), offline sync, Customer
  Signing Mode can slip to v0.5 if heavy.

## Sprint 15 — Pricing Intelligence / Quote Audit Lab
- **Goal:** owner/admin-only quote simulator + audit warnings + margin
  estimate + pricing versioning; role-visibility audit completes the
  foreman boundary.
- **Why last of this arc:** high value but zero dependency pressure, and
  safest once roles/dashboards are stable.
- **Out of scope:** per-branch pricing (standardized by decision), $7/mi
  trailer model (documented only).

### Parked behind this arc (need their own planning)
Role + Scope / Branch model (`branchId` everywhere), `driver*` →
`foreman*` rename + person-registry consolidation, Customer Move Link,
Notification Center polish (can ride along Sprint 10), fleet capacity
realism pass, backend/auth.
