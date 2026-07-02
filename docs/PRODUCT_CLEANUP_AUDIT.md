# Product Cleanup Audit

Tracks the Product Sense Reset program. This is a multi-installment effort;
this document records what shipped, what stayed and why, what is still a
placeholder, and what is genuinely blocked on a backend.

Each surface is judged against five questions: **Who uses it? What job are
they completing? What data do they need? What action do they take? What
happens after?**

---

## Installment 1 — Sales workflow rebuild + load balancing (SHIPPED)

### Rebuilt
- **Leads are now a real, persisted store** (`src/lib/store/leads.ts`) — the
  single source of truth for both the Pipeline board and the Leads table. No
  more per-page `useState` seed copies that reset on navigation.
- **Leads page = database view** (`leads-table.tsx`): columns for name, source,
  contact, stage, seller, created, last-contacted, follow-up, est. value, quote
  status. Filters: status (New / Needs follow-up / Quote not sent / Quote sent /
  Booked / Lost), seller, source, date range, search.
- **Pipeline page = Kanban board**: real moving-company stages (New Lead →
  Contacted → Quote Requested → Quote Drafted → Quote Sent → Follow-Up Needed →
  Booked → Converted → Lost / Cancelled). Drag a card to change stage; the
  change persists to the store and writes an activity-log entry.
- **One set of real lead actions** (`components/sales/lead-actions.tsx`), reused
  by cards, table rows, and the detail page: Open, Call (`tel:`), Email
  (`mailto:`), Mark contacted, Create quote, Convert to booked job, Schedule
  follow-up, Add note, Mark lost, Assign/Reassign seller. No dead buttons.
- **Lead detail** is store-backed with an action bar, notes/activity log, and
  ownership history.

### Load balancing / seller assignment (Sales addition)
- Every lead carries `assignedSellerId`, `assignedSellerName`, `source`,
  `priority`, `createdAt`, `lastContactedAt`, `nextFollowUpAt`, stage,
  `ownershipHistory`, `noteLog`.
- **Views**: All / Unassigned queue / per-seller (owner & sales manager);
  sellers are **locked to their own book** and never see other sellers' leads
  or the scope selector.
- **Workload metrics** header: open leads, unassigned, follow-ups due today,
  overdue, and per-seller open counts.
- **Bulk actions** (owner only): assign to a seller, distribute evenly
  (round-robin across active sellers), mark contacted, schedule follow-up,
  change stage. Every bulk action logs to the activity log.
- Assigning a lead pushes a **`lead_assigned` notification scoped to sellers**
  (not fleet/payroll/etc).
- Added two more sellers (Daniela Rios, Andres Molina) so distribution and
  workload views are meaningful.
- Handles volume: the board is horizontally scrollable with per-stage counts;
  the table paginates visually via filters — 100+ leads stay navigable.

### Other cleanups this installment
- **Removed** the dead "New lead" button on the Leads page (no create flow yet).
- **Removed** the meaningless blue progress bar under each foreman in Payroll;
  kept the labelled "% of period payroll" text instead.
- **Removed** "View Notifications" from Owner Quick Actions (it duplicated the
  bell). Quick Actions are now role-specific actions, not nav duplicates.
- Added payout-configuration helper text explaining it affects future payroll
  and requires Save (Owner/Accounting only).
- **Deleted** `src/lib/data/leads.ts` (static seed) — replaced by the store +
  `src/lib/seeds/leads.ts`.

### Stayed (and why)
- **Pipeline AND Leads both stay** — they are now genuinely distinct: Pipeline
  is the visual board (drag to move stages, workload at a glance), Leads is the
  database (filter/sort/bulk-manage). This is the documented product decision.
- Quotes builder, customers — unchanged; already coherent.

### Still placeholder / backend-blocked
- "Create quote" navigates to the quote builder with `?leadId=`; deep
  prefilling of the builder from the lead is a follow-up.
- Schedule-follow-up and Add-note use a lightweight prompt; a styled dialog is
  a polish item (the action itself is real and persists).
- Per-**user** notification targeting (only the exact assigned seller) needs a
  logged-in-user identity; today notifications are scoped by **role** (seller),
  so all sellers in the demo share the seller inbox. True per-user routing is a
  backend/auth concern.

---

## Installment 2 — Payroll Ileana-style + Marcus Reyes demo (SHIPPED)

### Rebuilt
- **Foreman payroll detail is now Ileana-style**: the weekly table shows Date,
  Job #, Customer, Crew/Foreman, Job type, Model/commission %, Commissionable,
  Commission earned, and a Notes column (deduction reason / on-hold reason /
  audit flag). A "Commission earned this period" line closes the table.
- **Signed summary block** ("Payroll summary — {week}"): Commission earned →
  + Reimbursements → − Deducted → − On hold → **Take-home total**, mirroring the
  Ileana payroll sheet. The KPI stat row and the reimbursement/deduction/on-hold
  line-item cards remain for the descriptions.
- Payout-configuration helper text clarifies it drives future payroll, requires
  Save, and is Owner/Accounting only.

### Marcus Reyes demo (Section 5D)
- New `src/lib/seeds/payroll-demo.ts` gives Marcus (FM-1042) a full current-week
  set: a normal local move, a long-distance move (Miami → Orlando), a normal
  move, a job with a **$120 deduction**, and a job **on hold pending audit** —
  plus a matching **reimbursable expense** (EXP-M901, packing material) that
  flows in automatically.
- Payroll now reads from `src/lib/payroll/data.ts`, which merges the demo with
  the mock arrays — so the same data shows consistently on the payroll home, the
  foreman detail, and the foreman self-view, **without** polluting the global
  Jobs list or Dispatch board. This also begins the seed split (Section 11).

### Expenses → payroll (Section 5E) — confirmed working
- Approved, reimbursable, out-of-pocket expenses inside the pay period appear
  under "Added / reimbursements" and add to the take-home total automatically.

### Deductions / on-hold (Section 5F) — confirmed working
- `deductions` on a payroll line subtract automatically; `Flagged` lines are
  held (their payout is subtracted as On hold) until audit clears them.

## Remaining installments (NOT yet done — require go-ahead)

Each of these is a substantial piece; they were intentionally not rushed:

| # | Section | Scope |
| - | ------- | ----- |
| 2 | Jobs page rebuild | Calendar-first, day cards, operational statuses, search, empty state |
| 3 | Dispatch operational board | Layout polish, week strip w/ counts, **Pending Dispatch Changes** panel (confirm individual / confirm all), single reassign workflow everywhere |
| 4 | Foremen roster/today view | Expandable cards w/ today's jobs, status/availability controls, directory tab |
| 6 | Notifications action-based overhaul | Priority + due date + resolve on every notification; prune non-actionable |
| 8 | Settings → Users & Access | WordPress-style users table: role, status, activate/deactivate, reset perms |
| 9 | Dashboard command center | Today's ops / sales / finance / risk / overnight-activity sections |
| 10 | Analytics | Build real charts (revenue, conversion, forecast) or hide the module |
| 11 | Seed split | Split the 5,383-LOC `mock-data.ts` into `seeds/*` (leads already done) |
| 12 | Shared calendar controls | `DateStrip` / `PeriodNavigator` / `WeekNavigator` reused across pages |
| + | Truck capacity guardrails | CuFt capacity on vehicles, quote/job/dispatch warnings, multi-job daily load |

### Known large files (Section 14 watch)
- `src/lib/mock-data.ts` — 5,383 LOC. **Must be split** in installment 11.
- `job-detail.tsx` (1,046) and `quote-builder.tsx` (1,046) — canonical domain
  surfaces; flagged for extraction, not yet split.
