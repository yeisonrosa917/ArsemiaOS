# Sprint 2.2 — Assignments & Identity

Approved scope only: Operations tab consolidation, Daily Assignment Board,
assignment confirmation flow, identity (UserAvatar + photos), alerts cleanup,
future-oriented demo data, redirects/fallbacks. **No** Finance/Pricing/Payroll
seeds/Claims/Storage/Customer Portal/Foreman App/branch work.

Everything remains local demo state (Zustand + localStorage). "Notify" is an
**in-app status only** — no SMS/push/email is sent anywhere.

## 1. Operations Control: three tabs

`/operations` now has exactly **Board · Assignments · Alerts** (was six tabs).
Nothing was blindly deleted — the old tabs were folded:

| Old tab | New home |
|---|---|
| Schedule / Routes | Assignments (day-first view of who works on what) |
| Foreman Roster | Board → crew panel (grouped Assigned today / Available / Off duty) + Assignments lanes |
| Truck Assignment | Assignments → per-lane truck selector + load bar |
| Capacity & Load | Assignments → header KPI strip; breaches also raise Alerts |

Old `?tab=` values fall back gracefully (see `ROUTE_CHANGES.md`), and
`/routes` now redirects to `/operations?tab=assignments`.

## 2. Assignment data model (jobs store v3)

`src/lib/types.ts`:

- `Job.truckId?: string` — the truck actually carrying the job (day-level:
  setting a foreman's truck patches all their jobs on that date).
- `Job.assignment?: JobAssignment` with
  `status: "Draft" | "Notified" | "Confirmed" | "Declined" | "Needs Attention"`
  plus `notifiedAt / confirmedAt / declinedAt / declineReason / by` stamps.

`src/lib/store/jobs.ts` (persist key bumped `arsemia.jobs.v2 → v3` so stale
localStorage can't shadow the new seed):

- `assignJobToForeman(jobId, foremanId, foremanName)` → sets crew, status
  Unassigned→Assigned, assignment starts at Draft.
- `unassignJob(jobId)` → clears crew, truck and assignment.
- `assignTruckForDay(foremanId, dayIso, truckId?)`.
- `setAssignmentForDay(foremanId, dayIso, status, {by, reason})` — batch
  day transition; skips Cancelled/Completed.
- `setJobAssignment(jobId, status, {by, reason})` — per-job (Foreman Portal).

Every transition also writes an `activity-log` entry (module `Dispatch`,
object type `Assignment`) with the acting workspace user.

## 3. Future-oriented demo data

`src/lib/data/all-jobs.ts` re-anchors the whole seed relative to the real
current date (`SEED_TODAY = 2026-07-02` shifted by the day offset), so the
demo always has jobs today, tomorrow and in the coming weeks. A deterministic
hash of the job id assigns a stable mix of assignment states (Confirmed /
Notified / Draft / one Declined with a sanitized reason) and leaves a few
assigned jobs deliberately truckless so the Alerts tab has real work to show.
Future jobs can never be Completed/live. Demo names are sanitized — no real
POC/customer/payroll/claims data.

## 4. Daily Assignment Board (`assignments-board.tsx`)

For the selected date (shared DateNavigator):

- **Unassigned panel** — every open job without a foreman, each with an
  inline "Assign to foreman…" select (off-duty foremen excluded).
- **Foreman lanes** — one card per foreman: `UserAvatar` (photo or initials),
  availability chip, aggregate assignment badge, truck selector for the day
  (in-shop trucks flagged), load vs safe-capacity bar, the day's jobs (time,
  id, type, cuft, per-job assignment badge, remove ✕), overlap conflicts
  ringed with a clock icon, decline reason surfaced when present.
- **Lane actions** — Notify (in-app), Mark confirmed, Unconfirm. One foreman
  can carry multiple jobs; day actions batch across them.
- **Confirm all** — header button, disabled while critical gaps remain
  (unassigned jobs, lane without truck, truck in shop, off-duty but assigned);
  the blocking reasons are printed under the button.
- **KPI strip** — folded from Capacity & Load: jobs, unassigned, foremen
  working/available, trucks assigned/available (+over-capacity), confirmed
  progress.
- **Deep-link focus** — `?focus=FM-####` rings + scrolls a lane;
  `?focus=unassigned` rings the unassigned panel. Alerts CTAs use this.

## 5. Identity: UserAvatar + photos

- `src/components/shared/user-avatar.tsx` — single avatar for every person:
  photo when present, else high-contrast initials on a color derived
  deterministically from the name (same person = same color everywhere,
  never a blank circle).
- `src/lib/store/users.ts` — `WorkspaceUser.photoUrl?` (local data URI),
  `setPhoto()`, `updateProfile()` accepts `photoUrl`, and `profileFlags()`
  reports completeness (`missing: name/email/photo`).
- Assigned foremen without a photo get a **"No profile photo"** warning badge
  on the Assignments lanes and the Board crew panel, plus an Alerts entry.
- Used on: Assignments lanes, Dispatch job cards, Board crew panel, and
  available for all future surfaces.

## 6. Dispatch Board cleanup (not a rebuild)

- Job cards lead with **operational info**: start time + id + status, then
  foreman/truck, type/zone/volume, addresses; customer name demoted to the
  footer next to price.
- Right panel renamed to **"Foremen — selected date"** and split into
  *Assigned today / Available / Off duty* (folds the old roster: availability
  chips, day job counts, call links, photo warnings).
- Map demoted to **"Planned routes — Simulated"** with an explicit
  "Illustrative demo map — not live GPS" note; the "ETA" metric was replaced
  with the job's scheduled start time.
- **Reassign** now appears only after the dispatcher explicitly selects a job
  (no more phantom auto-selection of the first job in the queue).

## 7. Foreman Portal — confirm / decline

`src/components/foreman-portal/pending-assignments.tsx` (mounted on
`/foreman-portal`): the active foreman (role → `foremanId` mapping) sees
today's-and-future jobs still in Draft/Notified/Needs-Attention and can
**Confirm** or **Decline with an optional reason**. Writes through
`setJobAssignment`, so the dispatcher's board and Alerts update immediately.
Local demo only; hidden for non-foreman roles.

## 8. Alerts (all clickable → fixing surface)

Derived only from store data for the selected date:

| Alert | Severity | CTA |
|---|---|---|
| Job has no foreman | danger | Assignments → unassigned panel |
| Foreman assigned, no truck for the day | danger | Assignments → lane |
| Truck in shop but assigned | danger | Assignments → lane |
| Truck over capacity | danger | Assignments → lane |
| Foreman off duty but assigned | danger | Assignments → lane |
| Foreman declined (with reason) | danger | Assignments → lane |
| Foreman not confirmed (draft/notified) | warning | Assignments → lane |
| Possible time overlap | warning | Assignments → lane |
| Tomorrow still has unassigned jobs | warning | Assignments → unassigned panel |
| Assigned foreman missing profile photo | warning | Settings → Users & access |

“Unvalidated address” was **not** added: the Job model has no
address-validation field yet and we don't invent signals.

## 9. Deferred (out of Sprint 2.2)

- Photo **upload UI** — the store supports `photoUrl` + `setPhoto()`, but no
  file-picker was added to Settings yet (avoids expanding the Settings scope).
- "Default the Assignments tab to tomorrow" — the three tabs share one
  operational date; silently jumping the date when switching tabs was judged
  more confusing than helpful.
- Deep-linking a **date** from Alerts (e.g. the "tomorrow unassigned" alert
  can't switch the shared date yet — the CTA text tells the user to move one
  day forward).
- Address validation alert (no data support), Foreman App, customer portal,
  and everything on the sprint DO-NOT list.

## 10. Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — only pre-existing warnings in untouched files.
- `npm run build` — clean production build.
- Playwright smoke (23 checks): 3-tab shell, legacy fallbacks, both
  redirects, board cleanup (simulated map label, crew groups, no Reassign
  without selection), alerts CTAs, assign flow moves a job out of the
  unassigned panel, portal confirm removes a pending item, no blank avatars,
  no page errors.

## QA Patch — Human Dispatch & Assignments Unification

Applied after manual QA of Sprint 2.2. No routes changed (ROUTE_CHANGES.md
untouched); page behavior changed as follows.

### Source of truth

`src/lib/operations/day-status.ts` is the single derivation layer for "who
works on a date". Operations Board (crew panel), Assignments, Foremen &
Contractors, and Alerts all call the same selectors:

- `buildForemanDayStatuses({date, jobs, drivers, vehicles, users, overrides})`
  → per foreman: availability (override > roster), **assignment lifecycle**
  (aggregate of the day's jobs), **live work status** (derived from job
  statuses: no job / scheduled / en route / on job / done), jobs, truck for
  the day, default truck, load/capacity, conflicts, decline info, unsent
  changes, needs-attention reasons.
- `buildAssignmentDaySummary({date, jobs})` → Day Plan header counts.
- `getAvailableTrucksForDate(...)` → truck picker intelligence
  (current / suggested-default / good / warning / conflict / blocked).
- `getAssignmentHumanStatus(assignment, name)` → human label + meaning +
  next action for every lifecycle state.

The roster's static `status` field ("On Job", "En Route") is **no longer
shown as truth anywhere** — it only seeds the availability fallback.

### Assignment lifecycle (human language)

| Store status | Shown as | Meaning |
|---|---|---|
| `Draft` | Draft | Not sent to the foreman yet |
| `Notified` | Sent to app | Waiting for foreman confirmation (in-app demo) |
| `Confirmed` + `source: "foreman"` | Confirmed by foreman | Accepted in the portal |
| `Confirmed` + `source: "dispatcher"` | Confirmed by dispatch | Forced on the foreman's behalf — not the same thing |
| `Declined` | Declined by foreman | Shows reason + timestamp + next action |
| `Needs Attention` | Update not sent | Changed after sending (`changeNote` says what) |

Store rules (`jobs.ts`): moving a job or changing the truck **after** the
assignment was sent/confirmed automatically flips it to "Update not sent"
with a change note; re-sending (per job or per lane) clears it. Only the
affected foreman's jobs are touched — never the whole fleet.

### Assignments board (Daily Dispatch Control Board)

Four areas: **Day Plan header** (date, jobs / unassigned / draft / sent /
confirmed / declined / update-not-sent / critical-conflict counts + **Send
day plan** which sends all drafts and unsent changes), **Unassigned jobs**
(rich cards: time, id, customer, route, type/zone/cuft/miles/price, Assign +
View job), **Foreman lanes** (human status line with "Next:" action, decline
panel with who/when/why/next, smart truck picker with ★ suggested default /
⚠ warnings / ✕ blocked hints, per-job Move with pre-move warnings, per-job
Send update, Send to foreman / Confirm on behalf / Unconfirm), and
**Trucks for the day** (in use by whom / free / in shop).

Default truck: assigning a job auto-applies the foreman's default truck when
it is free and usable that day; otherwise the picker explains why not.

Every transition writes both the Activity Log and the per-job timeline
(`job-events` store).

### Foremen & Contractors

Rebuilt on the shared selector: reads the **live jobs store** (was reading
the static seed — assignments made on the board never showed up). Cards show
"Available — no job today" / "Offline — no job today" / live work status +
assignment lifecycle chip with meaning and next action. Filter chips with
live counts: All · Working today · Scheduled today · Confirmed · Not
confirmed · Declined · Update not sent · En route · On job · Available — no
job today · Off duty · Offline · Needs attention. "Open on board" deep-links
to the foreman's Assignments lane. The Directory tab's status column now
shows the derived day label instead of the stale roster status.

### Foreman portal

Pending = only what dispatch actually **sent** (drafts/unsent changes are
dispatcher-side state the foreman never saw). Confirm/decline stamps
`source: "foreman"` and writes the job timeline.

### QA patch deferrals

- "Mark delayed" / "blocked" live statuses — requires extending the
  `JobStatus` enum across every badge/filter surface; deferred.
- Job **swap** between two foremen — the move flow covers the QA scenario;
  swap would be two moves; deferred as a dedicated action.
- Branch/market on job cards — the Job model has no branch field (zones
  only, shown instead). Branch/franchise work stays out of scope.
- Truck "same branch" hint — no branch data on vehicles.
- Notifying the **old** foreman when a job is moved away from an
  already-sent day (their remaining plan is unchanged; the moved job's new
  foreman gets the needs-update flag). Documented limitation.
- Drag-and-drop — deliberately not built; action menu is the QA-patch scope.

## Known risks / notes

- Time-overlap detection still estimates duration as `hours ?? 4`.
- The roster (`drivers` in `mock-data`) is static demo data; lanes exist for
  every rostered foreman.
- Only one workspace user maps to a foreman (`FM-1042`), so most assigned
  foremen legitimately raise the "no profile photo" alert in the demo.
- The jobs persist bump (v3) intentionally orphans `arsemia.jobs.v2` in
  existing browsers; the stale key is ignored, not migrated.
