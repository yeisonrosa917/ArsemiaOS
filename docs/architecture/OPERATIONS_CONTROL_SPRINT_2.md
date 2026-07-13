# Operations Control — Sprint 2

Per `ARSEMIAOS_MASTER_PACK.md` §5 (tickets OPS-001…OPS-012 subset approved for
this sprint). Scope executed exactly as approved: no Storage, Claims, Finance,
Payroll seed, Automation, AI, backend or dashboard work.

## What changed

**/operations is now the daily command room with 6 tabs:**

| Tab | Source | Notes |
|---|---|---|
| Dispatch Board | existing `DispatchBoard` component | behavior unchanged; internal date strip hidden (shell navigator owns the date); Radix ScrollArea panels replaced with native scroll |
| Schedule / Routes | extracted `ScheduleView` (from `/routes` page body) | behavior unchanged; controlled-date mode |
| Foreman Roster | **new** | daily availability: status (incl. availability overrides), assigned truck, jobs for the selected date with links, call/profile actions |
| Truck Assignment | **new** | per truck: status, paired foreman, day jobs, load vs safe capacity bar, over/near-capacity + in-shop warnings |
| Capacity & Load | **new** | day KPIs: jobs, assigned/unassigned, foremen working/available, trucks assigned/available, day CuFt vs fleet safe capacity |
| Alerts | **new** | derived-only alerts: unassigned jobs, overlapping time windows per foreman (start + est. hours), off-duty foreman with jobs, in-shop truck with jobs, over-capacity loads |

**Shared date:** one `DateNavigator` (full-width 7-day strip, prev/next/today,
date picker, **per-day job counts**) drives every tab. Changing the date on any
tab carries to all others.

**Dispatch visual fixes:**
- Date strip: the internal strip is replaced by the shell's full-width
  grid-cols-7 navigator (strip buttons no longer cluster left).
- "Foremen on duty" + job-queue panels: Radix `ScrollArea` with `max-h` clipped
  content without a working scrollbar; both now use native
  `overflow-y-auto scrollbar-thin` containers. Verified scrollable in-browser.
- `DispatchBoard` standalone behavior preserved (uncontrolled fallback keeps
  its own strip/state).

## What remains mock/local-only (labelled in the UI)
- Foreman roster = static demo roster + local availability overrides.
- Fleet/trucks = local fleet store (demo seed).
- Jobs = shared local jobs store.
- All Capacity/Alerts numbers derive from that demo data.

## Deferred (not in this sprint)
- Map / Live View tab (master pack §5.8) — Board already embeds the mock map;
  a dedicated tab adds nothing real yet.
- Time-off/availability windows (§5.5 "Time Off Pending") — no time-off data
  model exists; only the available/break/offline override is shown.
- Set-availability / assign-job actions from the Roster tab — Dispatch Board
  remains the assignment surface (avoids duplicating reassign flows).
- Route optimization, drag-and-drop, real map.

## Known risks
- Tab components query the whole jobs array per render (fine at demo scale;
  the §12 query contracts apply when data grows).
- Conflict detection assumes `hours ?? 4` per job — heuristic, labelled
  "possible" in the UI.
- Truck→foreman pairing uses the roster's static `vehicleId`; a job whose
  foreman has no paired truck shows no truck warning.
- `/routes/page.tsx` is now a thin wrapper around `ScheduleView`
  (see ROUTE_CHANGES.md — the shell imports the component, not the page).
