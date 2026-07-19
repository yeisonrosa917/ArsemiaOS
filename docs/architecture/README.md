# ArsemiaOS — Architecture Documentation Map

Start here. This folder is the project's memory: what the product must
become, what has already been built, what was decided, and what comes next.

## How to use these docs before any future sprint

1. Read this README to know which document owns what.
2. Read `IMPLEMENTED.md` to know the current, honest state of the app.
3. Read `DECISIONS.md` — these are product law; do not re-litigate them.
4. Check `BACKLOG.md` and `ROADMAP.md` for what the next sprint should be.
5. Only then read the deep spec relevant to the sprint (master pack or the
   two workflow specs) for the details of what to build.
6. Implement ONE narrow sprint. Update `IMPLEMENTED.md` and the sprint doc
   when it ships. Never start Tickets/Sprint N+1 inside sprint N.

Sprint discipline (from the specs, kept here because it works):
reconciliation/report first when scope is unclear → one small sprint →
`tsc` / lint / build / smoke → manual QA → patch → then move forward.

## Document hierarchy

### Master reference

| Doc | Role |
|---|---|
| `ARSEMIAOS_MASTER_PACK.md` | The master product reference (vision, IA, module specs for Operations, Finance, Storage, labels/QR, materials, and more). When in doubt about intent, this wins. Long — read the section for the sprint at hand, not the whole file. |

### Spec / backlog docs (architecture "law" for future modules — not yet built)

| Doc | Role |
|---|---|
| `ARSEMIAOS_ORGANIZATION_ROLES_TICKETS_COMMUNICATIONS_SPEC.md` | Org structure, Role + Scope model, Tickets/Assistance Center, Communications Hub, Documents/COI, Customer Move Link, claims/deduction policy, queues and escalation. |
| `ARSEMIA_FOREMAN_APP_AND_FIELD_OPERATIONS_SPEC.md` | Foreman App, field execution, scanning/pallets/warehouse, availability & time-off, LD travel blocks, Customer Signing Mode, field event catalog, pricing-visibility boundary. |

### Living project-management docs (created in Sprint 3.5)

| Doc | Role |
|---|---|
| `README.md` (this file) | Map of all docs + how to use them + current risks. |
| `IMPLEMENTED.md` | What exists in the app today, per module, with honest status. Update at the end of every sprint. |
| `BACKLOG.md` | Prioritized backlog (Critical next / Soon / Later / Future), plus the Demo Reset and Dashboard-by-Role planning sections. |
| `ROADMAP.md` | The next 8–12 sprints in dependency order. |
| `DECISIONS.md` | Decision log — settled product rules. Additions welcome; silent reversals are not. |

### Sprint docs (what was actually built, per sprint)

| Doc | Covers |
|---|---|
| `OPERATIONS_CONTROL_SPRINT_2.md` | Sprint 2 (superseded six-tab Operations shell; historical). |
| `OPERATIONS_ASSIGNMENTS_SPRINT_2_2.md` | Sprint 2.2 Assignments & Identity + its two QA patches (human dispatch, calendar/date consistency). |
| `EVENT_TIMELINE_FOUNDATION_SPRINT_3.md` | Sprint 3 unified event/timeline foundation + its QA patch (acceptance semantics, default truck, role safety, warehouse preloads). |
| `ROUTE_CHANGES.md` | Every route/redirect change since the Sprint 1 IA cleanup. |

## Ground rules that apply to every sprint

- LocalStorage/Zustand prototype: no backend, no real auth, no external
  integrations, no real SMS/email. Anything that looks like sending is
  in-app demo state and must say so.
- Sanitized demo data only — never real POC/customer/payroll/claims data.
- Standardized pricing across branches; the $7/mile LD trailer model is
  documented but NOT implemented.
- Branch isolation (Miami/NY/LA) is a future data-model change; nothing
  fakes it today.
- User-facing language says "Foreman", never "Driver" (internal `driver*`
  naming debt is tracked in `BACKLOG.md`).
- No decorative modules, no fake states, human-first workflows.

## Current risks

1. **Doc sprawl** — five spec/sprint docs plus a 8.4k-line master pack;
   without this README's hierarchy it is easy to build from the wrong one.
2. **Static demo data can mislead** — the roster, map markers, and parts of
   mock-data predate the derived-status work; only what `IMPLEMENTED.md`
   marks Solid should be trusted as product logic.
3. **localStorage persistence makes QA confusing** — persisted stores
   shadow improved seeds until a version bump; testers see different data
   per browser. No reset tool exists yet (planned, see `BACKLOG.md`).
4. **No real backend/auth** — role switching is a local preference; nothing
   is secure and nothing syncs between browsers.
5. **No branch scope yet** — every record lacks `branchId`; the isolation
   promise is not enforceable at the data layer.
6. **`driver*` naming debt** — `Job.driverId/driverName`, `drivers` module
   vs. the Foreman product language.
7. **Dashboards are still generic** — the home page is owner-ish for every
   role; "what do I do today" per role is planned, not built.
8. **No demo reset tool** — stale persisted states accumulate across
   version bumps (orphaned keys documented in `BACKLOG.md`).
9. **Notifications badge/center needs polish** — the bell works but the
   center is basic and not role-scoped.
