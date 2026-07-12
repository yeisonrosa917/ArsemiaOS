# Route Changes — Sprint 1 (IA Cleanup)

Per `ARSEMIAOS_MASTER_PACK.md` §3/§17/§18 (tickets IA-001…IA-010).
All redirects are `permanent: false` in `next.config.mjs` (exact-path only).

## Moved / redirected top-level routes

| Old URL | New home | Redirect |
|---|---|---|
| `/dispatch` | Operations Control → Dispatch Board tab | `/operations?tab=board` |
| `/routes` | Operations Control → Schedule / Routes tab | `/operations?tab=schedule` |
| `/invoices` | Finance → Invoices tab | `/finance?tab=invoices` |
| `/expenses` | Finance → Expenses tab | `/finance?tab=expenses` |
| `/payroll` | Finance → Payroll tab | `/finance?tab=payroll` |
| `/analytics` | Reports (renamed workspace) | `/reports` |

## Unchanged (deliberately NOT redirected)

Detail/print/self-scoped routes keep their exact URLs:
`/invoices/[id]`, `/invoices/[id]/print`, `/expenses/[id]`,
`/payroll/foreman/[id]`, `/payroll/tools`, `/jobs/[id]`,
`/jobs/[id]/documents/[documentId]/print`, `/quotes/[id]`,
`/quotes/[id]/print`, `/foreman-portal`, `/foreman-portal/payroll`,
`/claims/[id]`, `/storage/[id]`, `/leads/[id]`, `/customers/[id]`,
`/fleet/[id]`, `/notifications`, `/activity`, `/settings`.

## Hidden from primary flow

- `/payroll/tools` — no longer linked as "Audit & period tools" for everyone;
  now an "Audit Tools" link inside Finance → Payroll, visible only with
  `payroll.audit` (Owner, Accounting). Route + permission unchanged.
- `/notifications` — already bell-only (previous sprint); unchanged here.

## Removed files (confirmed dead, 0 importers)

- `src/components/pipeline/pipeline-board.tsx` — superseded by `/pipeline` page.
- `src/components/claims/evidence-placeholder.tsx` — superseded by the claims
  thread evidence panel.

## Old page modules kept intentionally

`src/app/{dispatch,routes,invoices,expenses,payroll,analytics}/page.tsx` remain
in the tree: their URLs redirect, but the workspace shells lazy-import these
components as tab content (single implementation, no duplicated stores). Do not
delete them without moving their bodies into the shells first.

## Sprint 1.1 QA note — invoice row click

Reported after Sprint 1 review: clicking an invoice (e.g. Sofia Martinez) in
Finance → Invoices "did nothing". **Not a Sprint 1 regression** — the invoices
page was untouched by Sprint 1 and the behavior exists at the pre-sprint commit
(`8e6fda0`): the table row was styled `cursor-pointer` but only the small ID and
customer-name cells were actual links, so clicks on any other cell were dead.
The workspace relocation only surfaced it during review. Fixed by adding
row-level navigation (`onClick → /invoices/[id]`) while keeping the inner links
(so open-in-new-tab still works). No invoice business logic changed.

## Role landing changes

| Role | Old landing | New landing |
|---|---|---|
| Dispatcher | `/dispatch` | `/operations` |
| Accounting | `/payroll` | `/finance` |
| Marketing | `/analytics` | `/reports` |

## New ROUTE_REQUIRES entries

- `/operations`: `dispatch.view` OR `routes.view`
- `/finance`: `invoices.view` OR `expenses.view_all` OR `expenses.view_own` OR `payroll.view_all`
  (`expenses.view_own` is included so a Foreman following the portal's
  "My Expenses" link — which now redirects — still reaches their own expenses;
  the Finance shell shows them ONLY the Expenses tab.)
- `/reports`: `analytics.view`

Old entries (`/dispatch`, `/routes`, `/invoices`, `/expenses`, `/payroll`,
`/analytics`) are kept: detail routes inherit permissions from them and the
guard still evaluates them during client-side transitions.
