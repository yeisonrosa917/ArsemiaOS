# Sprint 3 — Timeline / Event System Foundation

One event spine for everything that happens in ArsemiaOS. Future Tickets,
COI/DocumentRequests, Claims evidence, Availability conflicts, Communications
and the Foreman App all write and read through this foundation — nothing
else was built in this sprint (no tickets, no COI, no claims layers, no
availability, no branch scope, no renames).

## 1. Unified schema

`ActivityEntry` (src/lib/types.ts) gained four optional fields:

| Field | Values | Purpose |
|---|---|---|
| `eventType` | e.g. `assignment_sent`, `job_reassigned` | machine-readable type |
| `source` | `owner_web` \| `foreman_portal` \| `system` | where the action came from |
| `linkedType` | `job`, `truck` emitted today; `user/assignment/document/ticket/claim/invoice` reserved | what it's linked to |
| `linkedId` | e.g. `JOB-S1061` | the linked record |

Old persisted entries lack these fields — every reader falls back to
`module/action/objectId/metadata.jobId`, so nothing breaks and nothing is
migrated destructively. The persist key stays `arsemia.activity-log.v1` on
purpose: entries users already created are preserved.

## 2. One write API

`logEvent(input)` in `src/lib/store/activity-log.ts` — callable from stores
and components (getState, no hook). It fills the legacy `/activity` fields
(module/action/objectType/objectId/title) so the existing page and its
filters keep working unchanged.

`EventContext` (`{actorId, actorName, actorRole, source, note}`) is the
actor envelope that UI components pass INTO jobs-store mutations. The
mutations write their own events — **no component dual-writes anymore**,
and no call site can forget.

## 3. What happened to the two stores

- `activity-log` is the unified store (richer schema won).
- `src/lib/store/job-events.ts` was **deleted**. Its four seed entries were
  folded into the activity seed as unified entries. Browsers that still
  hold `arsemia.job-events.v1` in localStorage keep their history through
  `readLegacyJobEvents()` — a read-only, tolerant reader merged into the
  Job Detail timeline and history drawer (rows labeled "earlier history").
  The old key is never written again.

## 4. Event types emitted today (nothing decorative)

| eventType | Emitted by |
|---|---|
| `assignment_drafted` | fresh assign (board select, modal confirm on unassigned) |
| `assignment_sent` | Send day plan / Send to foreman / per-job send |
| `assignment_update_sent` | re-send after a change (clears the flag) |
| `assignment_confirmed_by_foreman` | portal confirm (`source: foreman_portal`) |
| `assignment_confirmed_by_dispatch` | Confirm on behalf — explicitly worded "not confirmed by the foreman personally" |
| `assignment_declined_by_foreman` | portal decline, with reason + timestamp |
| `assignment_unconfirmed` | Unconfirm (back to draft) |
| `assignment_changed_after_sent` | reserved wording used via changeNote flows |
| `job_reassigned` | move on the board, ReassignModal confirm — "moved from A to B after the day plan was sent. Update not sent yet." |
| `truck_changed` | day-truck change/clear, incl. "Update not sent yet." when sent |
| `job_updated` | unassign, stage/cancel pending reassignment |
| `job_created` / `document_event` / `adjustment_event` | seed + adjustments/documents writers |

All emission for assignment lifecycle lives in ONE place:
`emitAssignmentEvent()` + the mutations in `src/lib/store/jobs.ts`.
Transitions that don't change anything (same status) emit nothing.

## 5. ReassignModal / pending reassignment lifecycle fix

`confirmPending` (and `confirmAllPending`) no longer write `driverId`
directly — they route through `assignJobToForeman` / `unassignJob`, so a
confirmed reassignment now:

- flips a sent/confirmed job to **"Update not sent"** with a change note;
- **clears the truck** (the old foreman's truck never silently follows the job);
- writes the `job_reassigned` timeline event (with the staged reason);
- keeps `/operations`, Alerts, and Foremen consistent automatically.

`stageReassignment`/`cancelPending` also log their own events. Job Detail's
pending-confirm handler no longer hardcodes "Mariana Castro" — it uses the
active workspace user. `assignJobToForeman` additionally clears `truckId`
on any foreman change (board move included).

## 6. Job Detail timeline

`job-event-log.tsx` is now the unified **Timeline** card: one chronological
stream (newest first) from the unified store — drafted / sent / confirmed
(by whom, from where) / declined (reason) / moved / truck changed / update
sent / adjustments / documents — each row with icon by eventType, actor,
source label (Owner Web / Foreman Portal), relative + absolute time.
The history drawer keeps its cross-store view (documents/invoices/claims/
expenses) but reads events only from the unified store + legacy reader.

## 7. Verification

- `npx tsc --noEmit`, `npm run lint`, `npm run build` — clean.
- New Playwright suite (15 checks): assign→publish→timeline, portal
  confirm with `foreman_portal` source, ReassignModal move of a SENT job →
  staged event + "after the day plan was sent. Update not sent yet." +
  lane flag, confirm-on-behalf wording, truck-change event, `/activity`
  rendering unified events with filters intact, zero page errors.
- Regression: QA-patch-2 suite still 26/26.

## Sprint 3 QA Patch — acceptance semantics, default truck, role safety, preloads

Applied after manual QA of Sprint 3. No routes changed.

### Acceptance semantics
- "Confirm on behalf" is GONE as a primary action. The lifecycle is:
  Draft → Sent to app → **Accepted by foreman** / Declined by foreman,
  with Update not sent / Update sent for changes after sending.
- Acceptance only happens in the Foreman Portal (`source: foreman_portal`,
  eventType `assignment_accepted_by_foreman`).
- **Dispatch override** is the rare emergency escape hatch: a small muted
  action on the lane, requires a reason (e.g. "confirmed by phone at
  7:10 AM"), renders as an amber "Dispatch override" chip — never as
  acceptance — and emits `assignment_dispatch_override` with the reason.
  The old event type names remain readable for persisted entries.
- Wording aligned across Assignments, Foremen, Portal, Alerts, Timeline:
  "waiting for {name} to accept", "Accepted by foreman", "has not
  accepted", "Dispatch override — foreman did not accept in app."

### Default truck behavior
- The truck dropdown is no longer the first step. Lanes show
  "Truck #04 — Marcus's default truck" (or "— override") with a
  **Change truck** link that opens the picker on demand.
- A truckless lane with a usable default shows a one-click
  "Use Marcus's default truck (#04)" button; assigning a job still
  auto-applies the default when free and usable (tight capacity applies
  with a warning; over-capacity, in-shop, and conflicts do not).
- When the default can't be used, the lane says exactly why: in shop /
  already assigned to X today / may be too small / no default assigned.

### Foreman role safety (temporary web portal era)
- Job Detail in the foreman role is a read-only **field view**: no
  Transfer/Reassign, no pending-reassignment confirm, no address/building/
  inventory/notes/confirmations edits, no document Generate/Mark sent/
  Sign-as/Void (Preview + Print stay), no adjustment review actions
  (foreman sees "waiting on sales/admin review"). Mutation helpers are
  also guarded, not just hidden.
- A foreman can only open jobs assigned to their own FM-#### id; other
  jobs show "This job is not assigned to you."
- Foreman Portal shows the linked identity (name · FM-####), splits
  "Waiting for your response" from "Upcoming accepted", explains empty
  states, renames Confirm → **Accept**, and shows an explicit
  "not linked to a foreman profile" card when the mapping is missing.

### Warehouse preload / load-before-delivery tasks
- New lightweight store `src/lib/store/preload-tasks.ts`: internal
  operational tasks ("load at Doral warehouse the day before delivery")
  linked to a delivery job, seeded deterministically from upcoming
  Delivery/Storage-Out demo jobs. Statuses: Needed / Assigned /
  Completed / Skipped (skip requires a note).
- Visible on Assignments lanes (violet operational block with fatigue and
  truck-in-shop warnings, Mark loaded / Skip actions), in the Day Plan
  header count, in a "preloads without a foreman" strip, and in the
  Foreman Portal ("Load at … before leaving that day" + Mark loaded).
- Completing/skipping emits `warehouse_preload_completed/skipped` on the
  delivery job's timeline.
- **Deferred (documented TODO):** automatic task creation for new
  bookings, warehouse/scanning/pallet systems, LD travel blocks.

### Backlog note — future sales / AI intake (documented only, NOT built)
Future flow: inquiry → Lead → Quote Draft → seller review → quote sent →
customer accepts → Job → Operations assignment. Sources will include the
website form, an AI website assistant, SMS/email/phone, referrals and
repeat customers. Rule: AI may create a Lead or Quote Draft, but a human
seller must review before the final quote is sent. Nothing of this exists
in code yet.

## Known limitations

- Seed timeline history exists for JOB-10421 only; other jobs accumulate
  events from live actions (deliberate — no fabricated history).
- `/activity` renders unified entries through the legacy humanizer's
  title fallback; a dedicated eventType-aware renderer can come with the
  Tickets sprint if needed.
- The old `arsemia.job-events.v1` key stays in existing browsers
  (read-only); it is ignored everywhere except the tolerant reader.
