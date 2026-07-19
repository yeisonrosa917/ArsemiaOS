# ArsemiaOS — Decision Log

Settled product rules. Future sprints build on these; do not silently
reverse them. Add new decisions with a date; if one must change, record
the reversal here with the reason.

## Command & source of truth
1. **Owner/Operations is the command center.** Operations (Board /
   Assignments / Alerts) is where the day is run; other modules feed it.
2. **Assignments is the source of truth** for who works, which job,
   which truck, on which day, and what changed. No surface may derive
   "who works today" from anything but the jobs/assignments data
   (shared selectors in `src/lib/operations/day-status.ts`).
3. **Every important record eventually needs** owner/queue, status,
   priority, next action, timeline, scope, escalation (org spec §1).
   The unified event store is the timeline backbone for all of it.

## Assignment lifecycle
4. **"Accepted by foreman" only comes from the Foreman Portal/App.**
   Dispatch cannot accept on a foreman's behalf.
5. **Dispatch override is exceptional**, requires a typed reason, is
   rendered and logged as "not foreman acceptance", and lives behind an
   advanced action — never a primary button.
6. **Changes after sending must be visible**: sent/accepted assignments
   that change flip to "Update not sent" until the affected foreman is
   re-sent; only affected foremen are notified.
7. **Default truck first**: assigning a foreman auto-uses their default
   truck when valid; manual truck choice is an override with explicit
   reasons when the default can't be used.

## Roles & visibility
8. **Foreman is execution-only.** No editing of lead/customer/core job/
   pricing/admin data; no transfer/reassign; no admin document actions;
   read-only field view of their own jobs only.
9. **Foreman never sees internal pricing** (margins, simulators, per-item
   pricing rules, branch P&L). Customer-facing totals only where
   operationally needed. Pricing Intelligence is Owner/Admin territory.
10. **Only Foreman and Warehouse/Storage Operator create item scans**
    (future scan model); other roles view/audit.
11. **Branch isolation** (Main Owner sees all; branch owners see their
    market; Miami data stays Miami) is committed direction — requires the
    future Role+Scope/`branchId` sprint; nothing fakes it meanwhile.

## Sales & intake
12. **AI may draft leads/quotes, but a human seller must review before
    the final quote is sent.** No AI-sent quotes, ever.
13. **Pricing is standardized across branches/franchises** for now. The
    $7/mile LD trailer/linehaul model is documented but NOT implemented.

## Routing & communications
14. **Tickets/Assistance Center routes issues to the correct workspace**
    (dispatch/documents/claims/fleet/storage/finance/owner). Foreman
    assistance, calls, and module escalations become tickets — not chat
    messages or memory.
15. **Communications Hub is internal** (company staff working calls/SMS);
    **Customer Move Link is external** (the customer's window). They are
    different products and must not merge.
16. **Customer Move Link is a simple secure token link** — no accounts,
    no passwords, revocable, expiring, never keyed by job number alone.
    No full customer portal at MVP.

## Data & honesty
17. **Sanitized demo data only.** Never real POC/customer/payroll/claims
    data, names, or internal references.
18. **Demo data must be realistic enough to test operations** — local
    moves are local, LD goes far, future-anchored dates, plausible
    default trucks; bad demo data teaches bad product logic.
19. **No decorative modules, no fake states.** Simulated things say
    "simulated"; local-only things say so; empty days show empty states,
    not scenery. In-app "send" never implies real SMS/email.
20. **User-facing language says "Foreman", never "Driver".** The internal
    `driver*` naming is tracked debt (`BACKLOG.md` #17), to be paid in a
    dedicated cleanup, not incidentally.
21. **There must eventually be a Demo Reset tool** (reset all / per
    domain / empty company / realistic dataset / import-export) — design
    in `BACKLOG.md`; planned as Sprint 6 in `ROADMAP.md`.

## Engineering practice
22. **One narrow sprint at a time**, gated by tsc/lint/build/smoke and
    manual QA; QA patches before new scope; reconciliation reports before
    ambiguous scope.
23. **One event write API.** All meaningful actions log through
    `logEvent()`/store-emitted events; no component dual-writes; new
    modules must join the spine, not invent their own history.
24. **Seed-schema changes bump the store's persist key version**; readers
    stay tolerant of old shapes (Sprint 3 pattern).
