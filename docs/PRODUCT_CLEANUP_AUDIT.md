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

## Installment 3 — Jobs calendar + Users & Access (SHIPPED)

### Jobs page rebuilt (Section 2)
- **Calendar-first**: Prev / Today / Tomorrow / Next / date picker, plus
  **Day / Week / List** views. Day and Week render operational job cards; List
  falls back to the searchable database table.
- Job cards show ID, customer, time window, type, pickup→delivery city,
  foreman, truck, status, CuFt, miles, customer total, and priority.
- Filters: status (operational statuses), type, foreman, and full-text search
  (job ID, customer, phone, address, foreman, truck, city).
- **Useful empty state**: distinguishes "no jobs on this day" (offers *View next
  booked date* / *Create quote* / *Back to today*) from "N jobs, 0 match
  filters". Defaults to the latest active day so the calendar is never blank.
- Foreman sees only their own jobs; no company financials.
- Removed the dead Export/New-job header buttons (already gone) and the dead
  pager in the list view.

### Settings → Users & Access (Section 8)
- New `src/lib/store/users.ts` (workspace directory seeded from the auth users)
  + `users-access-card.tsx`: a WordPress-style table with initials avatars,
  email, **change role** (inline select), status badge, **activate/deactivate**,
  **reset permissions to role default**, **edit profile**, last-active
  placeholder, and a link to the foreman payroll profile where applicable.
- Every action mutates the store and writes a Permissions activity-log entry.
- Two additional sellers now appear here (Daniela Rios, Andres Molina) — 9 users
  total. No blank avatars (initials fallback, stable color).

## Installment 4 — Dispatch + Foremen + Truck capacity (SHIPPED)

### Dispatch (Section 3)
- **Pending Dispatch Changes** panel (`pending-changes.tsx`): lists every staged
  reassignment (job, customer, old→new foreman, reason, changed-by, time) with
  **Confirm** / **Cancel** per row and **Confirm all** / **Cancel all**.
  Confirming writes the job change + activity log + notification.
- Job-queue count is honest: "0 jobs on selected date" vs "N on this date · M
  match filters" (no more misleading "0 of 20").
- **One reassign workflow everywhere**: removed the duplicate inline
  assign/reassign dropdowns from Job Detail; both the header button and the
  "Assigned foreman" card now open the same `ReassignModal` used by Dispatch and
  the Foremen roster.

### Foremen (Section 4)
- **Roster / Today** view: operational cards (name, status, availability, truck,
  base, jobs-today count, next job time, current status, doc status). Cards
  **expand** to show today's jobs with Open / Reassign / (per foreman) Call and
  **Set availability** (available / break / offline — owner/dispatch only, via a
  new persisted availability store).
- **Directory** view: compact contact table with truck capacity, rating, docs,
  and a payroll link for payroll-capable roles.
- Search + filters (status, base, documents) + date. **Revenue removed from the
  operational roster** (it belongs to Payroll/Analytics).

### Truck capacity guardrails (addition)
- `src/lib/fleet/capacity.ts`: every vehicle type has a max + safe-recommended
  CuFt; seeded onto all vehicles and **editable in Fleet detail**.
- **Reassign modal guardrail**: shows the job's CuFt vs the new foreman's truck
  with green (fits) / yellow (tight) / red (over) status; an over-capacity
  assignment is **blocked until explicitly acknowledged**.
- **Job Detail** shows the assigned truck's capacity status for the job.
- Multi-truck AI recommendations are intentionally NOT built — the data
  structure and guardrails are in place for that later.

## Installment 5 — Dashboard command center + action-based notifications (SHIPPED)

### Dashboard (Section 9)
- Rebuilt from a static demo into a live **command center** that reads the real
  stores. Sections, each gated by capability so a non-owner only sees what they
  can act on:
  - **Today's operations** — active jobs, unassigned, jobs at risk (unassigned
    or over truck capacity), foremen on road, trucks available, trucks in shop.
  - **Sales attention** — unassigned leads, follow-ups due today, overdue
    follow-ups, quotes sent, booked.
  - **Finance attention** — payroll flags, expenses pending, invoices overdue,
    reimbursements pending.
  - **Risk & claims** — open, new/untriaged, under review.
  - **Needs your action** — the role's actionable notifications, priority-dotted.
  - **Recent activity** — the latest audit-log entries.
- Every tile links to the exact page; no decorative KPI cards.

### Notifications (Section 6) — action-based
- Added `priority` (low/normal/high/urgent) and `dueDate` to notifications;
  shown on the notifications page and the dashboard action list.
- Pruned non-actionable noise: "invoice paid" and "claim resolved" no longer
  generate notifications (they were good-news info, not to-dos). Fleet /
  expense / invoice / claim alerts now carry priority and (where relevant) a due
  date. Resolve = dismiss (already present); role routing already enforced.
- Note: the old chart components (RevenueChart, JobsStatusChart, KpiCard, etc.)
  are now unused by the dashboard and are reserved for the Analytics installment.

## Installment 6 — Schedule data through September + Analytics (SHIPPED)

### Data April → September (Section 11, pragmatic)
- `src/lib/seeds/schedule.ts` **deterministically generates** ~130 jobs from
  April 1 → September 30 (seeded PRNG, no `Date.now()` → identical on server and
  client, no hydration risk): history (Completed), current week (in-flight), and
  future bookings (Booked/Assigned/some Unassigned) across all foremen.
- `src/lib/data/all-jobs.ts` merges the hand-written mock jobs with the generated
  schedule. The jobs **store**, `/jobs/[id]` `generateStaticParams`, Jobs,
  Dispatch, Foremen, Dashboard, Customers, and Analytics all read from it — so
  future bookings and history show **consistently and are clickable** (a
  generated job's detail page renders without crashing).
- Leads (`seeds/leads.ts`) and payroll (`seeds/payroll-demo.ts`) were already
  split into `seeds/`.

### Analytics (Section 10) — built, not hidden
- Rebuilt to compute **live** from `allJobs` + leads + payroll + expenses:
  revenue by month **actual vs booked/forecast through September**, KPIs
  (completed revenue, booked pipeline, lead→booking %, payroll vs revenue),
  sales funnel (lead→booking, quote→booking), revenue by job type, revenue by
  foreman, lead-source performance, expenses by category.

### Deliberately deferred (with reason)
- **Physically shrinking `mock-data.ts` (5,383 LOC) is NOT done.** Data now flows
  through accessors/seed modules, so the functional goal is met; physically
  moving the hand-written arrays is high-churn, low-value, and risks breaking the
  many detail pages that reference specific mock IDs. Recommended only alongside
  a full "everything reads the jobs store" migration.
- The old dashboard chart components remain unused (reserved for future reuse).

## Remaining installments (NOT yet done — require go-ahead)

Each of these is a substantial piece; they were intentionally not rushed:

| # | Section | Scope |
| - | ------- | ----- |
| 12 | Shared calendar controls | Optional: extract `DateStrip` / `PeriodNavigator` into shared components (date logic is already consistent + SSR-safe across pages) |

### Known large files (Section 14 watch)
- `src/lib/mock-data.ts` — 5,383 LOC. **Must be split** in installment 11.
- `job-detail.tsx` (1,046) and `quote-builder.tsx` (1,046) — canonical domain
  surfaces; flagged for extraction, not yet split.
