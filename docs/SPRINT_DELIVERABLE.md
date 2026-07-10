# Sprint Deliverable — Operational Intelligence Expansion

> Review package for the "Operational Intelligence Expansion" sprint.
> **Nothing here is committed beyond the code already on the branch** — this
> document is the last uncommitted file, prepared for your localhost review.
> No backend, no external services. All data is local (`localStorage`).

---

## 0. Snapshot / metrics

| Item | Value |
|---|---|
| **1. Commit hash (HEAD)** | `871d0c02d72a341a9efc6880cc9068d1b7c90185` (`871d0c0`) |
| **2. Branch name** | `claude/funny-mayer-wkp9ue` |
| **Sprint base commit** | `76ce0e6` (parent of the first sprint commit `4b23e91`) |
| **3. LOC before** | 31,966 lines (`src/**/*.ts,tsx`, 134 files) |
| **4. LOC after** | 34,682 lines (`src/**/*.ts,tsx`, 140 files) — net **+2,716** |
| Diff totals | 31 files changed, **+3,787 / −892** |
| Sprint commits | 13 |

### 5. Files added (6)
```
src/app/storage/page.tsx                      # Storage index
src/app/storage/[id]/page.tsx                 # Storage unit detail
src/components/settings/catalog-approval-card.tsx
src/lib/calculator/parse-items.ts             # quote text parser
src/lib/store/catalog-pending.ts              # pending catalog store
src/lib/store/storage.ts                      # storage store
```

### 6. Files modified (25)
```
docs/PRODUCT_CLEANUP_AUDIT.md
src/app/claims/page.tsx
src/app/claims/[id]/page.tsx
src/app/customers/[id]/page.tsx
src/app/fleet/[id]/page.tsx
src/app/notifications/page.tsx
src/app/page.tsx                              # dashboard
src/app/routes/page.tsx                       # routes rebuild
src/app/settings/page.tsx
src/components/jobs/job-detail.tsx
src/components/layout/sidebar.tsx
src/components/notifications/notifications-bell.tsx
src/components/quotes/quote-builder.tsx
src/components/settings/users-access-card.tsx
src/lib/auth/capabilities.ts
src/lib/auth/roles.ts
src/lib/mock-data.ts
src/lib/notifications/audience.ts
src/lib/payroll/data.ts
src/lib/seeds/payroll-demo.ts
src/lib/store/claims.ts
src/lib/store/fleet.ts
src/lib/store/notifications.ts
src/lib/store/users.ts
src/lib/utils.ts
```

### 7. Files removed
**None.** (Two pre-existing components are now dead code but were *not* deleted — see Known Issues §D.)

### 8. New routes added
- `/storage` — Storage index (providers + units)
- `/storage/[id]` — Storage unit detail
- `/routes` was **rebuilt in place** (already existed as a placeholder route; not a new path).

### 9. New stores added
- `src/lib/store/storage.ts` — `useStorage` (providers, units, items, scans)
- `src/lib/store/catalog-pending.ts` — `useCatalogPending` (catalog suggestions)

### 10. New data models / types added
- **Storage:** `StorageProvider`, `StorageProviderKind`, `StorageUnit`, `StorageUnitStatus`, `ScanStage` (8), `ScanEvent`, `StorageItem`, `ItemCondition`, `MaintenanceRecord`* (*in fleet store)
- **Catalog:** `PendingCatalogItem`, `PendingStatus`
- **Claims:** `CreateClaimInput` + new `createClaim` mutation
- **Fleet:** `MaintenanceRecord`, `MaintenanceKind`, `MaintenanceOutcome`
- **Parser:** `ParsedMatch`, `ParsedUnmatched`, `ParseResult`
- **Auth:** capabilities `storage.view`, `storage.manage`; capability group `Storage`
- **Users:** `inviteUser` / `removeUser` mutations

### 11. What already existed before this sprint
Claims store + basic claim data; Dashboard; Fleet store + vehicles + `/fleet/[id]` editor; Jobs/Dispatch/Foremen/Customers/Leads/Quotes/Invoices/Expenses/Payroll/Analytics; the **role/capability system** (`resolveCapabilities`, `RouteGuard`, deny-by-default); the notifications system; the moving **calculator catalog** (`PRESET_ITEMS`, company config catalog); **Expenses→Payroll reimbursement** wiring; the Marcus Reyes payroll demo; the `/foreman-portal` placeholder; `telHref`.

### 12. What was shell-only before this sprint
- `/routes` — a **decorative map placeholder** with two **disabled** buttons ("Optimize all", "New route").
- `/foreman-portal` — placeholder landing page (still is; see §16/§17).
- Claims detail — a static evidence view (upgraded to a thread earlier this sprint).

### 13. What was actually implemented (this sprint)
Claims Gmail-style inbox + threads + lifecycle states; Dashboard fleet/maintenance + upcoming schedule + colour hierarchy; **Storage module** (providers, units, inventory, 8-stage scan chain-of-custody, damage/missing, destination grouping, damage→claim link); **Routes/Schedule** day board; address→Maps + phone→tel links; quote **paste-a-list** parser; **pending catalog approval**; calculator **reset**; **Luis/Andres** payroll demos; fleet **maintenance + inspection log**; **Users & Access** invite/remove. Plus a **real bug fix** (storage detail infinite-render, React #185).

### 14. What was intentionally NOT implemented (per your constraints)
Backend/API, real auth/SSO/passwords, real email/SMS, full mobile Foreman App, real AI, route optimization / live drive-time map, storage billing/invoice sync.

### 15. What remains placeholder
- `/foreman-portal` — still a foundation/placeholder (not touched this sprint).
- Live route **map** on `/routes` was removed; the board is real data but there is **no map**.
- Foreman/truck/amount on a storage-originated claim are **stubbed** (`—` / `$0`).

### 16. What requires backend later
Persistence beyond one browser; real user invites (email) + SSO + passwords; storage billing/invoice sync; claim/expense/payroll approvals as real workflow with audit; cross-device data; server-generated collision-safe IDs.

### 17. What requires mobile / Foreman App later
The dedicated **scan screen** (this sprint scans from the desktop unit detail); foreman self-service job/checklist/photo capture; `/foreman-portal` build-out.

### 18. What requires real AI / API later
Route optimization; smarter quote parsing (the current parser is deterministic token-matching, not ML); maintenance "intelligence"/prediction; any generated content.

---

## Feature-by-feature

Legend: **Complete** = built + verified in browser · **Partial** = works but with a named gap · **Placeholder** = shell only · **Not started**.

### Claims Gmail-style inbox / thread — **Complete**
- Files: `src/lib/store/claims.ts`, `src/app/claims/page.tsx`, `src/app/claims/[id]/page.tsx`, `src/lib/notifications/audience.ts`, `src/lib/store/notifications.ts`
- Test: `/claims` → unread dots, filters, state tabs → open a claim → post an internal note / reply / note to foreman → change status/priority → "Request foreman response" (check `/notifications`).
- Limitations: messages are local; "no external email is sent" is labelled in the composer.
- Next: attach real evidence uploads; SLA timers.

### Dashboard redesign — **Complete**
- Files: `src/app/page.tsx`
- Test: `/` as Owner → Fleet & maintenance tiles, Upcoming schedule 7-day strip, risk tiles.
- Limitations: "today" is pinned to `2026-07-02` for deterministic counts.
- Next: make the date follow real "today" once data is live.

### Storage third-party provider model — **Complete**
- Files: `src/lib/store/storage.ts`, `src/app/storage/page.tsx`
- Test: `/storage` → four providers (CubeSmart, Public Storage, Extra Space, Arsemia Self-Storage); click a provider card to filter units; third-party vs in-house badges.
- Limitations: provider list is seed data; no add/edit provider UI.
- Next: provider CRUD + monthly cost rollups per provider.

### Storage inventory scanning / check-off — **Complete**
- Files: `src/lib/store/storage.ts` (`advanceScan`, `SCAN_STAGES`), `src/app/storage/[id]/page.tsx`
- Test: `/storage/UNIT-505` → expand an item → "Scan → next stage" advances the 8-stage chain; the progress rail fills.
- Limitations: desktop-only; no barcode/QR capture; scanner name = the active role's user.
- Next: mobile scan screen; bulk scan.

### Storage damaged/missing item flow — **Complete**
- Files: `src/lib/store/storage.ts` (`setCondition`), `src/app/storage/[id]/page.tsx`
- Test: `/storage/UNIT-503` → expand "Antique Dresser" (Damaged) / "Floor Lamp" (Missing) → set condition buttons → red flag + count on the unit and index.
- Limitations: condition change writes a scan event but no photo evidence.
- Next: require a photo + note when marking Damaged/Missing.

### Storage scan history — **Complete**
- Files: `src/lib/store/storage.ts` (`scanHistory`, `ScanEvent`), `src/app/storage/[id]/page.tsx`
- Test: expand any item → "Chain of custody" list shows each stage, who, where, when.
- Limitations: seed history is synthesised backwards from the current stage.
- Next: link each scan to the scanning device/foreman id.

### Storage connection to Jobs — **Partial**
- Files: `src/app/storage/[id]/page.tsx`
- Test: `/storage/UNIT-501` → the unit shows "Job JOB-10421".
- **Limitation (honest):** the job link points to `/jobs` (the **list**), not `/jobs/JOB-10421`. Items also carry `jobId` but there's no per-item job deep-link.
- Next: change `href` to `/jobs/${unit.jobId}` (one-line fix).

### Storage connection to Claims — **Complete**
- Files: `src/app/storage/[id]/page.tsx`, `src/lib/store/claims.ts` (`createClaim`), `src/lib/store/storage.ts` (`linkItemClaim`, `item.claimId`)
- Test: `/storage/UNIT-503` → expand damaged "Antique Dresser" → **File a claim** → "View claim CLM-####" link appears → open it → thread shows "Opened from Storage unit A-045 …".
- Limitations: created claim is sparse — foreman = last scanner, truck `—`, amount `$0`; the claim's own "Connections" card does not link *back* to storage.
- Next: pass truck + estimated amount; add a storage back-link on the claim.

### Routes / Schedule planning — **Partial (accessibility gap)**
- Files: `src/app/routes/page.tsx`
- Test: open **`/routes` directly** → day navigator, jobs grouped by foreman with stop order/time/cities/load, unassigned lane, day stats.
- **Limitation (honest & important):** `/routes` is **not in the sidebar** — it is only reachable by typing the URL. (It wasn't linked before either; the rebuild didn't add it.) There is also no map and no drag-to-reassign.
- Next: add a "Routes" sidebar item under Operate/People & Assets (gated on `routes.view`).

### Address / map / phone links — **Complete**
- Files: `src/lib/utils.ts` (`mapsHref`), `src/components/jobs/job-detail.tsx`, `src/app/customers/[id]/page.tsx`, `src/app/storage/[id]/page.tsx`
- Test: `/customers/CUS-401` (phone→tel, email→mailto); a job detail ("Open in Maps" per address, phone→tel); `/storage/UNIT-501` provider address→Maps, phone→tel.
- Limitations: not applied to every address in the app (dispatch/leads still plain in places).
- Next: sweep remaining address/phone fields.

### Quote item text parser — **Complete**
- Files: `src/lib/calculator/parse-items.ts`, `src/components/quotes/quote-builder.tsx`
- Test: `/quotes` → "Paste an item list" → paste `3 dining chairs / sofa 3 seater / 2x queen mattress / couch / fridge / unicorn saddle` → **Parse & add** → matched items added; unmatched ("unicorn saddle") listed with search + "suggest to catalog".
- Limitations: deterministic matching (synonyms + token overlap), not ML; descriptor+generic phrases ("leather sofa") may miss.
- Next: expand synonyms; fuzzy threshold tuning.

### Pending catalog item approvals — **Complete**
- Files: `src/lib/store/catalog-pending.ts`, `src/components/settings/catalog-approval-card.tsx`, `src/app/settings/page.tsx`, `src/components/quotes/quote-builder.tsx`
- Test: Settings → **Calculator & Pricing** → "Catalog approvals" (3 seeded) → set ft³ + category → **Approve** (adds a real `CatalogItem`) or **Reject**; from `/quotes` paste panel, "suggest to catalog" adds a submission.
- Limitations: approved item id = slug(name) → two suggestions with the same slug would overwrite; no dedupe against existing catalog.
- Next: dedupe + id collision guard.

### Calculator reset buttons — **Complete**
- Files: `src/components/quotes/quote-builder.tsx`
- Test: `/quotes` → fill fields/inventory → **Reset · new estimate** (bottom of the summary card) → confirm → all fields clear.
- Limitations: single reset control (no per-section reset).
- Next: none required.

### Expenses to Payroll — **Complete (pre-existing; not built this sprint)**
- Files: `src/app/payroll/foreman/[id]/page.tsx` (`useExpenses` reimbursements)
- Test: `/payroll/foreman/FM-1042` → "Out-of-pocket expenses approved in this period" pulls approved reimbursable expenses.
- Limitations: matches by foreman + pay period; local data.
- Next: n/a this sprint — flagged so you know it predates this work.

### Luis / Andres / Marcus payroll examples — **Complete**
- Files: `src/lib/seeds/payroll-demo.ts`, `src/lib/payroll/data.ts`, `src/lib/mock-data.ts` (drivers FM-1049/FM-1050 + trucks VEH-212/218)
- Test: `/payroll` (all three listed) → `/payroll/foreman/FM-1049` (Luis) and `/FM-1050` (Andres) → weekly jobs + lines (local, long-distance, full-pack, a deduction, pending/flagged).
- **Limitation (honest):** Luis/Andres are dated to the **current** pay week (always visible); **Marcus is on his original week** (Jun 30–Jul 5), so Marcus's detail is **empty in the default weekly view** and needs the week navigator to reach. Marcus stayed put because he's tied to a fixed reimbursable expense.
- Next: optionally re-anchor Marcus to the current week + move his expense with him.

### Foreman App foundation — **Placeholder (pre-existing; not built this sprint)**
- Files: `src/app/foreman-portal/page.tsx`, `src/app/foreman-portal/payroll/*`
- Test: switch role to **Foreman** (Settings → Users, or role switcher) → sidebar becomes the Foreman Portal (Foreman Portal, My Jobs, My Payroll, My Expenses).
- Limitations: portal is a foundation shell; no field workflows, no scan screen.
- Next: requires the mobile app / backend — out of scope per your rules.

### Truck inspections — **Complete**
- Files: `src/lib/store/fleet.ts` (`MaintenanceRecord` kind `Inspection`), `src/app/fleet/[id]/page.tsx`
- Test: `/fleet/VEH-230` → "Maintenance & inspections" shows a **Failed** annual DOT inspection; "Log service" → set type=Inspection, outcome=Passed/Failed → **Add record**.
- Limitations: no inspection *scheduling*/reminders beyond the shared next-maintenance date.
- Next: dedicated inspection-due window on the dashboard fleet section.

### Vehicle maintenance intelligence — **Partial**
- Files: `src/lib/store/fleet.ts`, `src/app/fleet/[id]/page.tsx`, `src/app/page.tsx` (dashboard fleet tiles, pre-existing)
- Test: `/fleet/VEH-212` → service history; logging a record **with a next-due date** advances the truck's `nextMaintenance`; the dashboard "Fleet & maintenance" section flags due windows.
- **Limitation (honest):** "intelligence" = rule-based due-date windows + a manual log. No prediction, no cost trending, no mileage-based service intervals.
- Next: mileage-interval service prediction; cost-per-truck analytics.

### Users & Access changes — **Complete**
- Files: `src/lib/store/users.ts` (`inviteUser`, `removeUser`), `src/components/settings/users-access-card.tsx`
- Test: Settings → **Users & Access** → **Invite user** (name + email + role → Send invite → appears as "Invited · pending first sign-in") → Manage → **Remove user** (Owner is protected). Role change + activate/deactivate + reset-to-default were already present.
- Limitations: no email is sent; invited users are immediately "active"; local-only.
- Next: real invite tokens + pending state (backend).

---

## A. Manual test checklist (exact URLs + clicks)

**Claims**
1. `/claims` → confirm inbox list, unread dots, click the "Awaiting response" filter, click a state tab (Active/Pending/Resolved).
2. Open any claim (`/claims/CLM-1001`) → composer → "Internal note" tab → type → **Send** → note appears in the thread.
3. Action rail → change **Status** and **Priority** → "Request foreman response" → open `/notifications` → confirm the alert.

**Storage (core flow you asked for)**
4. `/storage` → confirm 4 providers + stat row (Active units / Items / Damaged-missing / Monthly cost). Click a provider card → units filter.
5. Open `/storage/UNIT-505` → expand "King Bedroom Set" → **Scan → next stage** → progress rail advances.
6. Open `/storage/UNIT-503` → expand **Antique Dresser** → confirm red "Item damaged" banner → **File a claim** → confirm "View claim CLM-####".
7. Click that claim link → confirm the thread shows **"Opened from Storage unit A-045 …"** and type **Furniture Damage**.
8. Open `/storage/UNIT-502` (shared) → confirm items are labelled by **owner** (Aronson vs Khoury) and grouped by destination.

**Routes** — ⚠ not in the sidebar
9. Type `/routes` in the address bar → confirm the day board; use ◀ ▶ to move days; confirm foreman cards with stop order.

**Quotes**
10. `/quotes` → "Paste an item list" → paste a few lines (see feature test above) → **Parse & add** → matched added, unmatched listed → "suggest to catalog".
11. Bottom summary card → **Reset · new estimate** → confirm the form clears.

**Settings**
12. Settings → **Calculator & Pricing** → "Catalog approvals" → set ft³ + category → **Approve** → moves to "Recently reviewed / Approved".
13. Settings → **Users & Access** → **Invite user** → then Manage → **Remove user**.
14. Settings → **Audit Log** (`/activity`) → confirm the invite/approve/scan actions were logged.

**Fleet**
15. `/fleet/VEH-230` → "Maintenance & inspections" → confirm the **Failed** DOT inspection → **Log service** → add a record.

**Payroll**
16. `/payroll` → confirm Marcus, Luis, Andres listed → `/payroll/foreman/FM-1049` (Luis, full week) and `/payroll/foreman/FM-1042` (Marcus — **use the week navigator** back to Jun 30–Jul 5 to see his jobs).

---

## B. Role testing checklist

Switch roles via the role switcher (top bar) or Settings → Users. Confirm per role:

| Role | Landing | Storage in sidebar? | Routes reachable? | Notable forbidden routes (expect "Access denied") | Sensitive data |
|---|---|---|---|---|---|
| **Owner** | `/` | ✅ (view+manage) | ✅ (URL only) | none | sees all |
| **Dispatcher** | `/dispatch` | ✅ (view+manage) | ✅ (URL only) | `/payroll`, `/claims`, `/invoices`, `/expenses`, `/settings`* | no finance |
| **Seller** | `/pipeline` | ❌ | ❌ | `/`, `/storage`, `/payroll`, `/claims`, `/fleet`, `/routes`, `/dispatch` | sales only |
| **Accounting** | `/payroll` | ❌ (no `storage.view`) | ❌ | `/storage`, `/claims`, `/dispatch`, `/routes`, `/fleet`, `/leads`, `/quotes` | full finance |
| **Claims** | `/claims` | ✅ (view only) | ❌ | `/payroll`, `/fleet`, `/dispatch`, `/routes`, `/invoices`, `/settings` | claims + linked job/customer/foreman |
| **Marketing** | `/analytics` | ❌ | ❌ | `/storage`, `/payroll`, `/claims`, `/fleet`, `/routes`, `/dispatch`, `/quotes` | analytics + customers |
| **Foreman** | `/foreman-portal` | ❌ (separate portal nav) | ❌ | everything except own jobs/payroll/expenses | own data only |

*Settings is viewable but role/permission management is Owner-only.

For each role confirm: **sidebar** shows only permitted groups · **quick actions** on the dashboard respect caps · **notifications** are role-scoped (`filterNotificationsForRole`) · **forbidden routes** render the deny screen (deny-by-default) · **sensitive data** (payroll, financial) hidden from non-finance roles.

Storage-specific: **Claims** can *view* storage but the "File a claim" / scan buttons are **read-only** for them (needs `storage.manage`, which only Owner + Dispatcher have).

---

## C. Smoke test results (at `871d0c0`)

| Check | Result |
|---|---|
| **Typecheck** (`tsc --noEmit`) | ✅ **0 errors** |
| **Lint** (`next lint`) | ✅ **0 errors**, 5 warnings — all **pre-existing** (1 exhaustive-deps in `payroll-audit-panel.tsx`, 4 `<img>` in brand/print), **none in sprint files** |
| **Build** (`next build`) | ✅ **Compiled successfully**, 176/176 static pages generated |
| **Browser smoke** (Chromium) | ✅ 11 routes driven: `/`, `/routes`, `/storage`, `/storage/[id]`, `/quotes`, `/settings`, `/payroll`, `/payroll/foreman/FM-1049`, `/fleet`, `/fleet/[id]`, `/claims` — all render |
| **Console errors** | ✅ none (aside from a benign favicon `404`) |
| **Hydration warnings** | ✅ none observed |
| **Runtime crashes** | ✅ none now — **1 was found & fixed**: storage detail React #185 infinite-render (see §D-0) |

Interactive flows verified in-browser (not just curl): paste→add items, suggest→approve catalog, invite→remove user, fleet log-service, and storage damage→**File a claim**→linked thread.

---

## D. Known issues (brutally honest)

**D-0 (fixed, but you should know it shipped):** the storage detail page had a **React #185 infinite-render** from a selector returning a new array each render. It was **masked because Storage was only curl-tested** (SSR doesn't run the render loop). It is now fixed and browser-verified — but it's a reminder that earlier "verified" claims for that page were SSR-only.

**Looks unfinished / placeholder**
- `/routes` is **not linked in the sidebar** — hidden unless you know the URL.
- `/foreman-portal` is still a placeholder shell.
- `/routes` has **no map**; storage has **no barcode/QR** scan input.

**Local-only / mock-only (no backend)**
- **Everything persists to `localStorage` only** — per-browser, per-device. Invites, claims, scans, maintenance records, catalog approvals do **not** sync anywhere and are lost if storage is cleared.
- User "invites" send no email and are immediately active. Catalog "approval" edits a local catalog. Payroll/expenses are seed data.

**Does not persist correctly / could break later**
- **Runtime ID generators reset on reload.** `claimSeq` (CLM-9001+), `recordSeq` (MNT-6001+), storage scan counters, and `catalog-pending` (PC-2001+) are in-memory counters that restart at load. Across two sessions in the same browser, a newly created record can **reuse an ID already persisted** → React key collisions / a `/claims/CLM-9001` that resolves to the wrong claim. Only the user-invite id (timestamp-based) is collision-safe.
- **Persist version bumps discard local edits.** `fleet` was bumped to `v2` (and `claims` to `v2` earlier); a returning user's locally-edited vehicles/claims from the old version are **reseeded/lost** on first load after deploy.
- Storage `item.claimId` was added **without** a persist version bump — safe (additive/optional), but noted.

**Incomplete role access / data flow**
- Storage→Job link goes to `/jobs` (**list**), not the specific job — weak deep link.
- A storage-originated claim is **sparse** (foreman = last scanner, truck `—`, amount `$0`) and has **no back-link** to storage from the claim's Connections card.
- Marcus's payroll demo is **empty in the default week** (needs week navigation), while Luis/Andres are current-week — inconsistent first impression.

**Duplicate / dead UI**
- `src/components/notifications/evidence-placeholder.tsx` and `src/components/pipeline/pipeline-board.tsx` are **imported by 0 files** — dead code left in the tree (not deleted, per "don't remove existing functionality").

**Could break later**
- The quote parser is heuristic; odd inputs may mis-match or over-match (mitigated by the review-before-add UX).
- Deterministic "today" pins (`2026-07-02`) in Dashboard/Routes will look stale relative to a real clock once data is live.

---

## E. Final recommendation — review this first on localhost

Review in this order; it front-loads the highest-value and highest-risk items:

1. **The Storage damage→claim flow** (the headline of this sprint):
   `/storage/UNIT-503` → expand **Antique Dresser** → **File a claim** → open the claim → confirm the storage origin on the thread. This exercises Storage + Claims + the store-to-store link and the bug that was fixed.
2. **Storage breadth:** `/storage` (providers/stats) → `/storage/UNIT-505` (scan a stage) → `/storage/UNIT-502` (shared-unit owner labels + destination groups).
3. **Routes** — open **`/routes` directly** and decide whether you want it in the sidebar (it currently isn't).
4. **Quotes:** paste-a-list parse + **Reset**, then Settings → Catalog approvals to approve a suggestion.
5. **Payroll:** `/payroll/foreman/FM-1049` (Luis) — and note Marcus needs the **week navigator**.
6. **Roles:** switch to **Seller** and **Accounting** and confirm `/storage` is denied; **Claims** can view storage but not scan.

Then tell me which of the Known Issues (§D) you want addressed. My suggested top three quick wins (all one-to-few lines, no backend):
- add **Routes to the sidebar**,
- fix the **storage→job deep link** (`/jobs/${jobId}`),
- make **runtime IDs collision-safe** (timestamp-suffix the counters).
