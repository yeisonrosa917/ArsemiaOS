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

## Known risks / notes

- Time-overlap detection still estimates duration as `hours ?? 4`.
- The roster (`drivers` in `mock-data`) is static demo data; lanes exist for
  every rostered foreman.
- Only one workspace user maps to a foreman (`FM-1042`), so most assigned
  foremen legitimately raise the "no profile photo" alert in the demo.
- The jobs persist bump (v3) intentionally orphans `arsemia.jobs.v2` in
  existing browsers; the stale key is ignored, not migrated.
