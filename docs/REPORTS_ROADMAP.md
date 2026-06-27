# Reports — Roadmap

Reports are NOT a module in this phase. No sidebar entry, no `/reports`
route, no shell page. This file is the planning record so future Reports
can be derived from existing stores without redesigning data.

## Intent

A single Reports surface (later) that lets the Owner / Accountant generate
read-only summaries on demand and as recurring exports (CSV/PDF).

## Out of scope (now)

- Storage reports — Storage is not part of the Hub.
- Charts/dashboards beyond what Analytics already shows.
- Scheduled email delivery (depends on Integrations layer).

## Report families and their data sources

| Report                  | Sources (already in store)                      | Notes                                                 |
| ----------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| Sales (period)          | `leads`, `quotes`, `pipeline`, `customers`      | Conversion funnel, win rate, ASP                      |
| Booked Jobs (period)    | `jobs` (from mock-data, future store)           | By zone, by foreman, by type                          |
| Revenue (period)        | `invoices`                                      | Billed, collected, outstanding, overdue               |
| Payroll (period)        | `payrollLines` + `foreman-profiles` + `expenses`| Per foreman, with reimbursements + deductions roll-up |
| Expenses (period)       | `expenses` store                                | By category, by foreman, reimbursable vs company-paid |
| Claims (period)         | `claims` store                                  | Volume, amount at risk, reimbursed, by foreman        |
| Fleet (period)          | `fleet` store                                   | Maintenance, expiring docs, GPS uptime                |
| Tax summary (annual)    | `invoices` + `expenses` + `payroll`             | Gross revenue, deductible categories, contractor 1099 |

## Required to land a report

1. **Date range** input: weekly / monthly / custom (already exists in
   `lib/payroll/period.ts` — generalize there if needed).
2. **Scope filter**: by foreman, by zone, by job type. Read from existing
   stores.
3. **Output**: in-app table view with totals, then CSV download. PDF
   later, using the same printable-page pattern that `/invoices/[id]/print`
   already demonstrates.

## What lives in code today

- `useInvoices`, `useExpenses`, `useClaims`, `useFleet`, `useForemanProfiles`,
  `useActivityLog`, mock `payrollLines` and `jobs` — all queryable by
  date range and foreman.
- `lib/payroll/period.ts` — already exports `weeklyRange`, `monthlyRange`,
  `customRange`, `inRange`.

## When to build

After:

- Real `jobs` store replaces mock seed (so Sales / Revenue reports can
  trust the source of truth).
- Storage integration (S3 / R2) so PDFs can be persisted.
- Email / Accounting integration for scheduled delivery + bookkeeping push.

## Where Reports does NOT belong

- Sidebar primary nav — reserved for daily operational modules.
- Inside Settings — Settings is for configuration, not artifact generation.
- Job Detail — per-job artifacts go in the Documents panel, not Reports.

When the time comes, Reports will be a single top-level admin route with
sub-tabs per family above, gated by `analytics.export` capability.
