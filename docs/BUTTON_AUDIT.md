# Button & Action Audit

Every visible primary action across all 15 modules. Rule: a button must
navigate to a real page, mutate persisted state, open a real modal, or trigger
a real workflow — otherwise it is removed. Role-inappropriate actions are
hidden, not disabled. Verified during the Emergency Stability sprint by
loading and clicking each surface in a real browser.

Legend: **KEPT** works · **FIXED** repaired this sprint · **REMOVED** dead
shell deleted · **PLACEHOLDER** intentional, labelled, not a fake button.

---

## 1. Dashboard (`/`)
| Action | Status | Notes |
| --- | --- | --- |
| KPI / metric cards | KEPT | Read-only summaries |
| Recent jobs rows | KEPT | → `/jobs/[id]` |
| Quick Action (topbar) | KEPT | Role-specific; see Topbar |

## 2. Pipeline (`/pipeline`)
| Action | Status | Notes |
| --- | --- | --- |
| Stage columns / cards | KEPT | Drag/click cards, real lead data |
| Card → lead | KEPT | → `/leads/[id]` |

## 3. Leads (`/leads`)
| Action | Status | Notes |
| --- | --- | --- |
| Search / status filter | KEPT | Real filter state |
| Lead row | KEPT | → `/leads/[id]` |
| Convert to quote | KEPT | → `/quotes` with `leadId` param |

## 4. Quotes (`/quotes`)
| Action | Status | Notes |
| --- | --- | --- |
| Catalog / pricing inputs | KEPT | Wired to company-config store |
| Save quote | KEPT | Persists to quotes store + notification |
| Quote row | KEPT | → `/quotes/[id]` |
| Print | KEPT | → `/quotes/[id]/print` |

## 5. Customers (`/customers`)
| Action | Status | Notes |
| --- | --- | --- |
| Search / segment filter | KEPT | Real filter state |
| Customer row | KEPT | → `/customers/[id]` |

## 6. Dispatch (`/dispatch`)
| Action | Status | Notes |
| --- | --- | --- |
| Date strip ‹ / › | FIXED | Hardened against invalid dates (no RangeError) |
| Day chips | KEPT | Select day; safe ISO |
| Native date picker | FIXED | Cleared/invalid value falls back to today |
| "Today" shortcut | KEPT | Resets to today |
| Zone / Type / Foreman / Status filters | KEPT | Real filter state |
| **Assign / Reassign Foreman** | FIXED | Now opens the real `ReassignModal` (reason, before/after, pending → confirm, activity + notifications + job history) instead of a fake log |
| Call (selected job) | KEPT | `tel:` from customer phone |
| View Details | KEPT | → `/jobs/[id]` |
| View fleet board | KEPT | → `/fleet` |
| "Saved" filter button | REMOVED | No action — dead |
| "Date" dropdown (Today/Tomorrow/…) | REMOVED | No handler, duplicated the date strip |

## 7. Jobs (`/jobs`)
| Action | Status | Notes |
| --- | --- | --- |
| Search / type / status filters | KEPT | Real filter state |
| Status chips | KEPT | Counts scoped to role |
| Job row → Open | KEPT | → `/jobs/[id]` |
| Stats cards | FIXED | Scoped per role (foreman sees only own counts, no company revenue) |
| "Export CSV" header button | REMOVED | No handler — dead |
| "New job" header button | REMOVED | Jobs are created from accepted quotes, not here |
| "Prev / Next" pager | REMOVED | No pagination logic behind them |

### Job Detail (`/jobs/[id]`)
| Action | Status | Notes |
| --- | --- | --- |
| Job History | KEPT | Opens drawer, that job's timeline only, plain English |
| Transfer / Reassign | KEPT | `ReassignModal` with confirm flow |
| Edit inventory | KEPT | Real editor |
| Mark step done | KEPT | State mutation |
| Adjustments advance / reject | KEPT | State + notification |
| Documents: Generate / Preview / Print / Mark sent / Sign / Void | KEPT | All mutate; dates now SSR-safe |

## 8. Foremen (`/foremen`)
| Action | Status | Notes |
| --- | --- | --- |
| Foreman card / row | FIXED | Links to `/payroll/foreman/[id]` **only** for payroll-capable roles (owner/accounting); informational for dispatcher/claims — no broken access-denied jumps |
| "Schedule shifts" | REMOVED | Dead (prior sprint) |
| "Add foreman" | REMOVED | Belongs to mobile app flow (prior sprint) |

## 9. Fleet (`/fleet`)
| Action | Status | Notes |
| --- | --- | --- |
| Vehicle card / roster row | KEPT | → `/fleet/[id]` |
| "Schedule maintenance" | REMOVED | Dead (prior sprint) |
| "Add vehicle" | REMOVED | Dead (prior sprint) |

### Fleet Detail (`/fleet/[id]`)
| Action | Status | Notes |
| --- | --- | --- |
| Edit fields / Set status | KEPT | Mutates fleet store |

## 10. Invoices (`/invoices`)
| Action | Status | Notes |
| --- | --- | --- |
| Invoice row | KEPT | → `/invoices/[id]` |
| Mark Sent / Mark Paid / Mark Overdue / Void | KEPT | Mutates store + activity |
| Preview / Download PDF | KEPT | → `/invoices/[id]/print` |
| Payment dates | FIXED | SSR-safe (`formatDateTimeStable`) — no hydration mismatch |

## 11. Expenses (`/expenses`)
| Action | Status | Notes |
| --- | --- | --- |
| Search / status filters | KEPT | Real filter state |
| Row | KEPT | → `/expenses/[id]` |
| Role scope | FIXED | Foreman sees only their own expenses |
| "Manual entry" | REMOVED | Flow comes from Foreman App (prior sprint) |

### Expense Detail (`/expenses/[id]`)
| Action | Status | Notes |
| --- | --- | --- |
| Move to review / Approve / Reject / Mark Paid / Mark Reimbursed / Hold / Mark Duplicate / Request receipt / Add note / Reimbursable toggle | KEPT | All mutate state |
| Foreman cross-access | FIXED | A foreman opening another foreman's expense gets "Not available" |
| Dates | FIXED | SSR-safe |

## 12. Payroll (`/payroll` — Owner/Accounting)
| Action | Status | Notes |
| --- | --- | --- |
| This week / month / Custom | KEPT | Real range state |
| **Previous / Next period ‹ ›** | FIXED | Added — step weeks/months without opening the calendar |
| Foreman row | KEPT | → `/payroll/foreman/[id]` |
| Foreman-role access | FIXED | `/payroll` now requires `payroll.view_all` — foreman is blocked |

### Payroll Foreman Detail (`/payroll/foreman/[id]`)
| Action | Status | Notes |
| --- | --- | --- |
| Approve / Flag | KEPT | Writes activity |
| **Payout configuration** | FIXED | Now staged with **Save / Cancel / Unsaved-changes** — no longer mutates on keystroke |
| Foreman guard | FIXED | Foreman role gets "Not available" (can't view others) |

### My Payroll (`/foreman-portal/payroll` — Foreman, NEW)
| Action | Status | Notes |
| --- | --- | --- |
| Weekly / Monthly toggle + ‹ › | KEPT | Self-scoped period nav |
| Jobs / reimbursements / take-home | KEPT | Own records only — no other foremen, no approve/flag, no payout editing |

## 13. Claims (`/claims`)
| Action | Status | Notes |
| --- | --- | --- |
| Claim row | KEPT | → `/claims/[id]` |
| Status changes / Add Evidence / Request foreman response | KEPT | All mutate store |
| Dates | FIXED | SSR-safe |

## 14. Notifications (`/notifications`)
| Action | Status | Notes |
| --- | --- | --- |
| Mark all read / Mark read-unread / Open / Dismiss | KEPT | Real state |
| Severity / unread filters | KEPT | Real filter state |
| Role audience | FIXED | Filtered by role — Marketing never sees fleet, Seller never sees payroll, etc. |

## 15. Settings (`/settings`)
| Action | Status | Notes |
| --- | --- | --- |
| Quote modes / pricing / catalog / rooms / templates | KEPT | Mutate company-config store |
| Restore default permissions | KEPT | Real state |
| Integrations card | PLACEHOLDER | Framework only — labelled planned/in-design |
| Document template "Template only" banner | PLACEHOLDER | Legal disclaimer, not a button |

---

## Topbar Quick Actions (role-specific)
| Role | Actions |
| --- | --- |
| Owner | New Lead · New Quote · Add Foreman · Add Vehicle · Review Payroll · Review Claims · Notifications · Company Settings |
| Seller | New Lead · New Quote · View Pipeline · View Customers |
| Dispatcher | Today's Jobs · Dispatch Board · Foremen on duty |
| Accounting | Review Payroll · Review Expenses · View Invoices |
| Claims | Open Claims · File Claim |
| Marketing | Leads · Pipeline |
| Foreman | My Jobs · My Payroll · My Expenses |

## Command Palette
Permission-aware. Page entries and record groups (Jobs, Customers, Leads,
Quotes, Foremen, Invoices, Expenses, Claims, Fleet) only render if the active
role can reach that module. Records open exact detail pages. The Foremen group
is gated by payroll access (it routes into `/payroll/foreman/[id]`).

## Intentional placeholders (justified)
| Where | Why |
| --- | --- |
| Settings → Integrations | Structural framework, labelled planned/in-design |
| Document templates "Template only" banner | Legal disclaimer |
| Expense receipt image block | Storage layer not built |
| AI confidence / duplicate-risk bars | Visual gauges, no fake button |
| Foreman Portal "Foreman App coming soon" | Mobile app ships separately |
