# Button Audit — QA Sprint

Every visible button in primary workflows audited. Rule: a button must
navigate to a real page, mutate state, open a real modal, trigger a real
workflow — or be removed. No decorative buttons.

## Topbar / Quick Action

| Action               | Status  | Notes                                              |
| -------------------- | ------- | -------------------------------------------------- |
| Quick Action (Owner) | KEPT    | Dropdown — 8 real navigations                       |
| Owner → New Lead     | KEPT    | → /leads                                            |
| Owner → New Quote    | KEPT    | → /quotes                                           |
| Owner → Add Foreman  | KEPT    | → /foremen (list; add flow opens from there later) |
| Owner → Add Vehicle  | KEPT    | → /fleet                                            |
| Owner → Review Payroll | KEPT  | → /payroll                                          |
| Owner → Review Claims  | KEPT  | → /claims                                           |
| Owner → Notifications  | KEPT  | → /notifications                                    |
| Owner → Company Settings | KEPT | → /settings                                         |
| Seller CTA           | KEPT    | Dropdown — Lead/Quote/Pipeline/Customers           |
| Dispatcher CTA       | KEPT    | Today's Jobs / Dispatch Board / Foremen on duty    |
| Accountant CTA       | KEPT    | Payroll / Expenses / Invoices                      |
| Claims CTA           | KEPT    | Open Claims / File Claim                            |
| Marketing CTA        | KEPT    | Leads / Pipeline                                    |
| Foreman CTA          | KEPT    | My Portal / My Jobs / My Expenses                  |
| Search box (⌘K)      | KEPT    | Opens command palette                              |
| Notifications bell   | KEPT    | Dropdown + link to /notifications                  |
| Role switcher        | KEPT    | Dropdown — works                                   |
| Theme menu           | KEPT    | Works                                              |

REMOVED:
- Dispatcher quick-action “Assign Job” direct CTA — wasn't a real workflow; replaced by dropdown with “Dispatch Board”.

## Dispatch board

| Action                  | Status   | Notes                                                  |
| ----------------------- | -------- | ------------------------------------------------------ |
| Date strip prev/next    | KEPT     | Real day navigation                                    |
| Date picker             | KEPT     | Real <input type="date">                              |
| "Today" shortcut        | KEPT     | Resets to today                                        |
| Assign Foreman dropdown | KEPT     | Real reassign + activity log + notification           |
| Call (selected job)     | KEPT     | tel: link from customer phone                          |
| View Details            | KEPT     | → /jobs/[id]                                           |
| View fleet board (rail) | KEPT     | → /fleet                                               |
| “Live • 7 foremen” chip | REMOVED  | Was disabled, no action — pure decoration             |
| “New job” header CTA    | REMOVED  | Dispatcher shouldn't create jobs; Seller route        |
| Optimize Route          | REMOVED  | (already removed phase 2.6)                           |
| Maximize map icon       | REMOVED  | (already removed phase 2.6)                           |

## Job Detail

| Action                 | Status   | Notes                                                  |
| ---------------------- | -------- | ------------------------------------------------------ |
| Job History            | KEPT     | Opens right-side drawer with full timeline             |
| Transfer / Reassign    | KEPT     | Opens modal with stage + confirm flow                  |
| Edit inventory         | KEPT     | Real inventory editor                                  |
| Mark step done         | KEPT     | State mutation                                          |
| Adjustments → advance  | KEPT     | Real state advance                                      |
| Adjustments → reject   | KEPT     | Real state + notification                              |
| Documents → Generate   | KEPT     | Picks template, creates instance                       |
| Documents → Preview    | KEPT     | Inline preview pane                                    |
| Documents → Print      | KEPT     | → /jobs/[id]/documents/[documentId]/print              |
| Documents → Mark sent  | KEPT     | State mutation                                          |
| Documents → Sign       | KEPT     | State mutation, captures actor + ts                    |
| Documents → Void       | KEPT     | State mutation                                          |
| Adjustments “Manual entry” | REMOVED | Was disabled with title — replaced by foreman flow   |

## Foremen list

| Action            | Status   | Notes                                                |
| ----------------- | -------- | ---------------------------------------------------- |
| Foreman card row  | KEPT     | → /payroll/foreman/[id]                              |
| Table row name    | KEPT     | → /payroll/foreman/[id]                              |
| Schedule shifts   | REMOVED  | Was disabled with “coming in phase X” — dead button  |
| Add foreman       | REMOVED  | Same — Foreman creation belongs to mobile app flow   |

## Fleet list

| Action                | Status   | Notes                                                 |
| --------------------- | -------- | ----------------------------------------------------- |
| Vehicle card          | KEPT     | → /fleet/[id]                                         |
| Roster row            | KEPT     | → /fleet/[id]                                         |
| Schedule maintenance  | REMOVED  | Was disabled — dead                                   |
| Add vehicle           | REMOVED  | Was disabled — dead                                   |

## Expenses list

| Action            | Status   | Notes                                                 |
| ----------------- | -------- | ----------------------------------------------------- |
| Filter chips      | KEPT     | Real filter state                                     |
| Search            | KEPT     | Real filter state                                     |
| Row link          | KEPT     | → /expenses/[id]                                      |
| Manual entry      | REMOVED  | Was disabled — flow comes from Foreman App           |

## Expense Detail

All actions verified — Move to review / Approve / Mark Paid / Mark Reimbursed
/ Reject / Mark Duplicate / Hold / Request receipt / Change status menu / Add
note / Reimbursable toggle / Detection field edits — every one mutates state.

## Invoice Detail

All actions verified — Mark Sent / Mark Paid (records payment) / Mark Overdue /
Void / Preview / Download PDF — every one works. No decorative buttons.

## Claim Detail

All status changes / Add Evidence / Request foreman response — all real.

## Payroll

Foreman-first. Audit engine + period table moved to `/payroll/tools`.
Approve / Flag actions on detail are real (writes activity).
Range buttons (Week / Month / Custom) are real state.
No decorative buttons on the home surface.

REMOVED earlier (phase 4): old "Recompute period" + "Run payroll" disabled buttons
that were sitting in the header.

## Notifications

Mark all read / Mark read/unread / Open / Dismiss — all real state.

## Settings

Each section card → real card. Quote modes toggles, pricing field edits,
catalog add/edit/disable/delete, room editor, document template editor —
all mutate the persisted store. Restore default permissions per role: real
state.

## Command Palette

Now permission-aware. Each record-level group only shows up if the active
role can access that module. Each record row navigates to the exact detail
page: /jobs/[id], /customers/[id], /payroll/foreman/[id], /invoices/[id],
/expenses/[id], /claims/[id], /fleet/[id].

## Intentional placeholders (justified)

| Where                       | Why kept                                                       |
| --------------------------- | -------------------------------------------------------------- |
| Settings → Integrations card | Structural framework only — labelled with planned/in-design  |
| Document templates — "Template only" banner | Legal disclaimer, not a button        |
| Receipt placeholder image in expense detail | Visual placeholder, not an action |
| AI confidence / duplicate risk bars         | Visual placeholder, no fake button |
