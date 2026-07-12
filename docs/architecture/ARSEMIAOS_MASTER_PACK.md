# ARSEMIAOS MASTER PACK

**Version:** Single-file master pack 2026-07-12  
**Owner:** Yeison Rosa / Arsemia LLC  
**Purpose:** This file replaces the failed ZIP-based prompt packs. It is meant to be copied, edited, and selectively given to Claude Code. It is intentionally text-first, no images, no compressed folders, no hidden empty prompt files.

---

## 0. READ THIS FIRST

This document is not a one-shot instruction to Claude Code. Do **not** give Claude this file and say “build all of this.” That will recreate the same problem: decorative screens, duplicate modules, and bloated code.

Use this file as the single source of truth for ArsemiaOS direction. Each sprint must copy only the relevant section plus the execution prompt at the end of that section.

### Immediate rule

Claude must first audit the repo and propose consolidation. Claude must not code until the plan is approved.

### What this file solves

The earlier pack attempts failed because:

- ZIPs were inflated by images, not by useful text.
- Some generated prompt files were too short.
- The system tried to document too many things in too many files.
- Claude would have received scattered instructions instead of one clear product architecture.
- The real issue is not file size; the real issue is precision, sequence, and enforceable scope.

### How to use this file

1. Open this `.md` file locally.
2. Copy **Section 1 + Section 2 + Prompt P0** to Claude first.
3. Do not let Claude edit code yet.
4. Wait for Claude’s audit and route consolidation plan.
5. Then approve **one sprint only**.
6. After each sprint, run tests, review localhost, and audit code bloat.

---

# 1. MASTER VISION

ArsemiaOS is not a simple moving-company dashboard. ArsemiaOS is an intelligent operating system for a technology-enabled moving company.

The long-term product connects:

- Lead intake
- Sales pipeline
- Quotes
- Customers
- Jobs
- Dispatch
- Routes & Schedule
- Foremen
- Fleet
- Storage
- QR inventory
- Materials & Supplies
- Claims
- Invoices
- Expenses
- Payroll
- Analytics / Reports
- Integrations
- Automation Center
- AI Agents
- Affiliate/Growth Engine
- Field Growth / Foreman Academy

The system must connect every operational flow:

```text
Lead → Quote → Customer → Job → Dispatch → Foreman + Truck → Job Execution → Invoice → Payroll → Closeout
                                         ↓
                                      Storage
                                         ↓
                              QR labels / scans / PDFs
                                         ↓
                                      Claims
                                         ↓
                         Payroll holds / deductions / resolutions
```

## 1.1 Non-negotiable product principles

Every feature must answer at least one of these questions:

1. What does it automate?
2. What does it connect?
3. What error does it prevent?
4. What money does it save?
5. What decision does it improve?
6. What revenue can it generate?

If a page does not answer at least one, it is likely decoration.

## 1.2 Anti-bloat rule

Do not create separate sidebar buttons for pages that belong inside the same workspace. ArsemiaOS should not grow horizontally with more buttons. It should grow vertically with stronger workspaces.

Bad pattern:

```text
Dispatch
Routes & Schedule
Foremen
Fleet
```

all repeating the same daily operational questions.

Better pattern:

```text
Operations Control
  - Dispatch Board
  - Routes & Schedule
  - Foreman Roster
  - Truck Assignment
  - Capacity & Load
  - Map / Live View
  - Alerts
```

## 1.3 Current status and reality

Current project status based on local review:

- TypeScript passed.
- Build passed.
- Localhost works.
- Storage route exists now.
- Some UI is visually attractive.
- Many modules are still mock/local/Zustand-based and not production-ready.
- Several pages overlap in purpose.
- Some pages are beautiful but operationally weak.
- Backend is still missing.
- localStorage is not a production source of truth.

Current estimated maturity after sprint 05f8009 and localhost review:

```text
Frontend visual/prototype:      60–65%
Frontend functional real:       40–45%
Cross-module workflows:         30–35%
Backend/production:              0–5%
SaaS readiness:                  5–10%
Operational OS architecture:     25–35%
```

The next phase must not add more decoration. It must consolidate and prepare architecture.

---

# 2. FIRST CLAUDE MESSAGE — NO CODING

Copy this first message to Claude Code. Attach this master file if needed, but tell Claude to read only the relevant sections.

```text
You are acting as a senior software architect, product engineer, code auditor, and operational systems designer for ArsemiaOS.

Project context:
ArsemiaOS is an intelligent operating system for a moving company. It must connect sales, quotes, jobs, dispatch, foremen, trucks, storage, QR inventory, claims, invoices, expenses, payroll, reports, automation, AI agents, and growth operations.

Important instruction:
DO NOT CODE YET.
DO NOT MODIFY FILES YET.
DO NOT ADD NEW FEATURES YET.

Your first job is to audit the current repo and compare it against the architecture direction in this document.

Return a report with:
1. Full route inventory.
2. Modules that overlap or duplicate each other.
3. Pages that appear decorative or weakly connected.
4. Buttons/actions that likely do nothing or do not belong in primary flow.
5. Current sidebar analysis.
6. Proposed new workspace/sidebar structure.
7. Which existing pages should become tabs inside larger workspaces.
8. Which pages should be removed, hidden, or kept only as admin tools.
9. Which data stores need consolidation.
10. Biggest risks before coding.
11. Exact first implementation sprint.
12. Files likely affected by the first sprint.
13. Acceptance criteria for the first sprint.

Constraints:
- Do not rebuild Storage yet.
- Do not build Automation Center yet.
- Do not build AI agents yet.
- Do not start backend yet.
- Do not create new decorative pages.
- Do not remove useful functionality without listing the replacement path.
- Keep role-based access deny-by-default.
- Keep terminology “Foreman”, not “Driver”.
- The system must be backend-ready even if currently using Zustand/localStorage.

Wait for approval before editing files.
```

---

# 3. TARGET INFORMATION ARCHITECTURE

## 3.1 Problem with current navigation

Current modules create cognitive overload:

```text
Dashboard
Dispatch
Jobs
Routes & Schedule
Pipeline
Leads
Quotes
Customers
Foremen
Fleet
Storage
Invoices
Expenses
Payroll
Claims
Analytics
Settings
```

This is too many top-level destinations for a system that is about connected workflows.

## 3.2 Target sidebar/workspace model

Proposed top-level navigation:

```text
Dashboard
Sales
Operations
Jobs
Storage
Finance
Claims
Reports
Growth
Admin
```

Optional depending on implementation:

```text
Assets
```

If Assets is not top-level, it lives inside Admin or Operations.

## 3.3 Workspace responsibilities

### Dashboard
Purpose: command center for today. It should show what needs attention, not every chart.

Includes:
- Today’s operations
- Jobs at risk
- Unassigned jobs
- Overdue invoices
- Open claims
- Storage expiring/overdue
- Payroll flags
- Fleet/maintenance risks
- Material low-stock alerts
- Lead/Sales alerts
- AI/automation alerts later

### Sales
Includes:
- Pipeline
- Leads
- Quotes
- Customers
- Lead assignment
- Lead SLA
- Quote templates
- Room templates
- Seller workload

### Operations
Includes:
- Dispatch Board
- Routes & Schedule
- Foreman Roster
- Truck Assignment
- Capacity & Load
- Map / Live View
- Time Off / Availability later
- Operations alerts

### Jobs
Includes:
- Calendar/List
- Job Detail
- Documents
- Inventory
- Signatures
- Job Closeout
- Claim links
- Storage links
- Invoice links
- Payroll links

### Storage
Includes:
- Storage Command Center
- Storage Calendar
- Storage Jobs
- Units & Map
- Inventory
- Labels & QR
- Scan Sessions
- Exceptions
- Documents/PDFs
- Billing
- Customer portal preview

### Finance
Includes:
- Invoices
- Payments
- Expenses
- Payroll
- Reimbursements
- Deductions
- Storage Billing
- Affiliate Payouts later
- Audit Tools
- Reports

### Claims
Includes:
- Claims Inbox
- Assigned to Me
- Unassigned
- Awaiting Customer
- Awaiting Foreman
- Evidence Needed
- Payroll Impact
- Storage-related
- High Risk
- Closed/Resolved

### Reports
Former Analytics becomes Reports & Intelligence.

Includes:
- Sales Intelligence
- Operations Intelligence
- Foreman Performance
- Claims Risk
- Storage Intelligence
- Finance Reports
- Growth/Affiliate Performance later

### Growth
Future module.

Includes:
- Affiliates
- Referral codes
- Influencer campaigns
- Seller partner portal
- Commission tracking
- Campaign analytics

### Admin
Includes:
- Settings
- Users & Access
- Roles & Permissions
- Integrations
- Automation Center
- Assets & Inventory if not top-level
- Security & Compliance
- Audit Log

---

# 4. LOCALHOST REVIEW FINDINGS

These are high-priority findings from current localhost review.

## 4.1 Dispatch

URL:

```text
/dispatch
```

Problems:

- The calendar/date strip still occupies only part of the available width.
- The date navigator is not balanced or reusable enough.
- Dispatch overlaps with Routes & Schedule.
- The “Foremen on duty” right panel has visible CSS/card cutoff issues.
- Dispatch currently mixes queue, map, job card and roster but does not yet feel like a complete Operations Control workspace.

Required direction:

- Dispatch should become a tab inside Operations Control.
- Calendar should become a reusable full-width DateNavigator.
- Right panel cards must not clip/cut content.
- Dispatch should connect with Foreman availability, truck capacity, route assignment and job risk.

Acceptance criteria:

- Date strip is full-width, balanced, and reusable.
- Dispatch does not duplicate Routes; it shares Operations workspace data.
- Foremen panel renders without clipping.
- Selected day, job queue, map, foreman roster and truck assignment share the same state.

## 4.2 Routes & Schedule

URL:

```text
/routes
```

Problems:

- It duplicates Dispatch purpose.
- It should not exist as a separate top-level sidebar item if it is only daily routing.

Required direction:

- Move Routes & Schedule into Operations Control as a tab.
- Preserve useful route cards, foreman grouping, day load KPIs and day navigation.
- Remove duplicate route logic or make it share a common data source.

## 4.3 Fleet and Foremen overlap

Problems:

- Fleet, Foremen, Dispatch and Routes answer related daily operational questions.
- Fleet should not be daily dispatch. It should be asset management.

Required direction:

```text
Operations Control = use trucks and foremen today.
Fleet = maintain vehicles as assets.
Foremen = manage people profiles, history, documents, payroll, availability.
```

## 4.4 Finance

Current:

```text
Invoices
Expenses
Payroll
```

Problems:

- Separate top-level buttons will create sidebar bloat as Finance grows.
- Future Finance also includes reimbursements, deductions, storage billing, affiliate payouts, vendor bills and audit tools.

Required direction:

Create one Finance workspace with tabs:

```text
Overview
Invoices
Payments
Expenses
Payroll
Reimbursements
Deductions
Storage Billing
Affiliate Payouts
Audit Tools
Reports
```

## 4.5 Payroll page

URL:

```text
/payroll/foreman/FM-1049
```

Problems:

- Looks nice but has unnecessary columns in main view.
- `Crew / Foreman`, `Model`, and `Commissionable` should not be primary columns for a user-facing payroll statement.
- Prior/next payroll navigation is needed.
- `/payroll` needs filtering/sorting.
- `/payroll/tools` feels like bloat unless hidden as admin audit tools.

Required direction:

Main payroll statement columns:

```text
Date
Job #
Customer
Job Type
Job Value or Crew Commission
Person Earned
Adjustments
Notes
```

Advanced audit breakdown goes in expandable row or admin-only tab.

## 4.6 Claims

URLs:

```text
/claims
/claims/CLM-1005
```

Problems:

- Visually good but still a light mock.
- Missing assigned claims operator ownership.
- Missing transfer/reassign claim flow.
- Missing participants list.
- Missing internal company chat separated from customer-facing messages.
- Missing foreman response workflow.
- Missing final customer response/resolution workflow.
- Not yet designed for 1,000 claims, 100 operators, 500 foremen.

Required direction:

Claims must become an operational inbox with queues, SLA, ownership, escalation, internal war-room, evidence, final resolution and payroll/finance impact.

## 4.7 Analytics

URL:

```text
/analytics
```

Problems:

- Looks nice but usefulness is questionable.
- Generic revenue charts are not enough.

Required direction:

Rename or reposition as Reports & Intelligence with business-specific reports:

- Sales conversion by source/seller
- Foreman revenue vs claims
- Truck cost vs revenue
- Payroll vs revenue
- Storage revenue and overdue exposure
- Claims amount at risk
- Materials consumption and loss
- Affiliate lead quality later

## 4.8 Settings

Problems:

- Privacy & Data appears too prominent for current stage.
- Integrations is too weak for the future vision.
- Users & Access needs backend for real password/session management.
- Room Templates must connect to Quote Builder.
- Company Profile → Work Zone seems decorative unless rebuilt as Service Areas & Markets.

Required direction:

- Privacy moves under Security & Compliance.
- Integrations becomes a serious configuration center.
- Users & Access marks backend-required actions honestly.
- Room Templates apply directly to quote drafts.
- Work Zone removed or rebuilt as real Service Areas & Markets.

---

# 5. OPERATIONS CONTROL SPEC

## 5.1 Goal

Operations Control replaces disconnected Dispatch, Routes & Schedule, daily Foreman Roster and daily Truck Assignment pages.

It is the daily command room for:

- Which jobs happen today
- Which foremen are assigned
- Which trucks are assigned
- Route sequence
- Capacity risk
- Time conflicts
- Foreman availability
- Jobs at risk
- Live status updates

## 5.2 Tabs

```text
Operations Control
  1. Dispatch Board
  2. Schedule / Routes
  3. Foreman Roster
  4. Truck Assignment
  5. Capacity & Load
  6. Map / Live View
  7. Alerts
```

## 5.3 Dispatch Board tab

Purpose:

Show selected day’s job queue and currently selected job.

Main elements:

- Full-width DateNavigator
- Job queue with search/filter
- Selected job detail card
- Quick actions: Call, View Job, Assign/Reassign, Update Status
- Foreman/truck assignment summary
- Job risk badges

Filters:

```text
Status
Zone
Job Type
Foreman
Truck
Assigned/Unassigned
Capacity risk
Time conflict
```

## 5.4 Schedule / Routes tab

Purpose:

Show route grouping by foreman/truck for selected day.

Cards should show:

- Foreman
- Truck
- Stops
- Job order
- Start time
- Pickup/delivery addresses
- CuFt/load
- Miles
- Value
- Status

## 5.5 Foreman Roster tab

Purpose:

Daily operational availability, not full HR profile.

Each foreman row/card:

```text
Name
Status: Available / On Job / En Route / Break / Off / Time Off Pending
Truck
Base/location
Jobs today
Next job
Documents status
Availability window
```

Actions:

- Set availability
- Call
- View jobs today
- Assign job
- View profile

## 5.6 Truck Assignment tab

Purpose:

Daily truck deployment.

Fields:

```text
Truck
Type
Capacity
Current assigned CuFt
Assigned foreman
Assigned jobs
Maintenance status
Registration/insurance status
GPS status
Truck kit status
```

Rules:

- Warn if assigned load > 90% capacity.
- Block or require override if assigned load > safe capacity.
- Do not recommend truck if maintenance/out-of-service.

## 5.7 Capacity & Load tab

Purpose:

Detect daily risk before it becomes field failure.

KPIs:

```text
Total jobs
Total CuFt
Total trucks available
Total foremen available
Jobs over truck capacity
Unassigned jobs
LD jobs
Storage in/out
```

## 5.8 Map / Live View tab

Purpose:

Future real-time map. Current prototype can use mock map but must be labeled as mock.

## 5.9 Alerts tab

Shows:

- Unassigned jobs
- Over capacity
- Time conflicts
- Foreman unavailable
- Truck maintenance risk
- Route overlap
- Job missing documents
- Customer not confirmed

---

# 6. FINANCE WORKSPACE SPEC

## 6.1 Goal

Finance consolidates Invoices, Expenses, Payroll, Reimbursements, Deductions, Storage Billing, Affiliate Payouts and Audit Tools.

Top-level Finance tabs:

```text
Overview
Invoices
Payments
Expenses
Payroll
Reimbursements
Deductions
Storage Billing
Payouts
Audit Tools
Reports
```

## 6.2 Finance Overview

Shows:

- Revenue booked
- Invoices overdue
- Expenses pending approval
- Payroll ready/not ready
- Reimbursements pending
- Deductions pending review
- Storage billing due
- Cash flow alerts

## 6.3 Payroll main page

Needs:

- Weekly period selector
- Previous/Next period buttons
- Foreman filters
- Sort by amount generated
- Sort alphabetically
- Sort by payout status
- Show flags/on hold/deductions/reimbursements

Columns:

```text
Foreman
Period
Jobs
Generated / Commission Base
Earned
Added
Deducted
On Hold
Final Total
Status
```

## 6.4 Payroll foreman detail

Main statement should be simple.

Header:

```text
Foreman
Period
Payout model
Final total
Status
```

Job table:

```text
Date
Job #
Customer
Job Type
Crew Commission or Job Value
Foreman/Helper Earned
Notes
```

Expandable audit details:

```text
Commissionable base
Rate/model
Calculated amount
Paid amount
Difference
Audit flag
```

## 6.5 Real payroll seed

Use this real example for demo payroll.

Statement period:

```text
06/22/2026 – 06/28/2026
```

Crew statement:

```text
Gross payroll: $3,735.25
Deducted: $254.00
Added/Reimbursement: $102.04
Final total: $3,583.29
Commission model: 33.5% Yeison crew
```

Jobs:

```text
06/23/26 — 1510315 — Jhon — $213.40
06/23/26 — 1560977 — Jerrin Peter — $617.07
06/24/26 — 1395951 — Cristina Bayona — $255.02
06/24/26 — 1404690 — Nidia Rodrigues — $274.28
06/25/26 — 1543730 — Stephen Gentile — $524.36
06/26/26 — 1507070 — Jeff Rose — $866.90
06/27/26 — 1433021 — Gianna Peralta — $201.75
06/27/26 — 1513438 — Andrew Song — $83.75
06/27/26 — 1568645 — Michelangelo Restaino — $125.63
06/28/26 — 1546140 — Jordan Penev — $199.74
06/28/26 — 1506590 — Bryan Carpio — $373.36
```

Helper payments actually paid:

```text
Andrés POC: $820.00
Luis Rodriguez Torres: $720.00
```

Do not show bank account data in the app seed. Only show payroll operational amounts.

## 6.6 Payroll tools

`/payroll/tools` should not be a primary route.

Options:

1. Move under Finance → Payroll → Audit Tools.
2. Keep only for Owner/Accounting.
3. Remove if not used.

---

# 7. STORAGE OS SPEC

## 7.1 Goal

Storage is not a generic warehouse table. Storage is a moving-company chain-of-custody system for customer belongings.

It must manage:

- Storage jobs
- Storage providers/facilities
- Units
- Customer belongings
- Item labels and QR stickers
- Scan sessions
- PDFs and signatures
- Billing reminders
- Customer portal view
- Exceptions and claims
- Blankets/materials linked to storage

## 7.2 Main screens

```text
Storage Command Center
Storage Calendar
Storage Jobs
Units & Map
Storage Inventory
Label Printing
Scan Sessions
Exceptions & Claims
Blanket Ledger
Storage Billing
Customer Portal Preview
Documents / PDFs
```

## 7.3 Storage Command Center

Purpose:

Answer in 10 seconds:

```text
What enters storage today?
What leaves storage today?
What is expiring soon?
What is overdue?
Which units are full?
Which customers owe payment?
Which items are missing/damaged?
Which blankets/materials are trapped in storage?
Which scan sessions need completion?
```

KPIs:

```text
Active storage jobs
Items in storage
Jobs entering today
Jobs leaving today
Expiring soon
Overdue
Open exceptions
Open claims
Blankets outstanding
Storage billing due
```

Needs Attention panel:

- Overdue storage billing
- Expiring storage jobs
- Missing delivery-out date
- Missing scan session
- Damaged/missing item
- Blanket mismatch
- Unit over capacity

## 7.4 Storage Calendar

Views:

```text
Month
Week
Day
```

Day markers:

```text
Green = entering storage
Red = leaving storage
Yellow = expiring soon
Dark red = overdue
Purple = claim/exception follow-up
Blue = audit scheduled
Gray = no activity
```

Click day opens activity list:

```text
Storage-ins
Delivery-outs
Expiring jobs
Overdue customers
Audits
Claims follow-up
```

## 7.5 Storage Jobs

Fields:

```text
Storage Job ID
Customer
Original Job ID
Storage-In Date
Expected Delivery-Out Date
Provider
Facility
Unit(s)
Item Count
Blankets Used
Billing Status
Storage Status
Exceptions
Claims
```

Statuses:

```text
Pending Storage-In
In Storage
Expiring Soon
Overdue
Scheduled Out
Partially Delivered Out
Closed
Claim Open
```

## 7.6 Units & Map

Use the idea of a visual Section Overview, but adapted to moving-company storage.

Each provider/facility has a unit grid.

Each unit block shows:

```text
Unit number
Capacity %
Customer count
Item count
Open claims
Monthly cost
Paid through date
Overdue status
Blankets trapped
Notes indicator
```

Colors:

```text
Green = healthy
Yellow = near full / expiring soon
Red = overdue / action required
Gray = empty
Purple = mixed/split customer or special handling
Blue = audit scheduled
```

Click unit opens Unit Detail.

## 7.7 Unit Detail

Header:

```text
Provider / Facility / Unit
Status
Capacity %
Customers
Items
Blankets
Monthly cost
Next billing date
```

Tabs:

```text
Overview
Inventory
Scan Sessions
Exceptions
Billing
Documents
Notes
```

Inventory tab must be a compact table, not large cards.

Columns:

```text
Label #
QR
Item Name
Room
Customer
Job
Status
Condition
Blankets
Last Scan
Scanned By
Exception
Actions
```

Actions:

```text
View item
Mark checked
Report damaged
Report missing
Create claim
Move to another unit
Pull for delivery
View chain of custody
```

## 7.8 Storage Inventory

Global item-first search.

Search fields:

```text
Item #
QR code
Customer
Job
Item name
Room
Unit
Status
Condition
```

Statuses:

```text
Expected
Label Printed
Picked Up
Loaded to Truck
Received in Storage
In Storage
Pulled for Delivery
Loaded for Delivery
Delivered
Missing
Damaged
Claimed
```

## 7.9 Label Printing / QR Stickers

Workflow:

```text
Select Job
Load expected inventory
Assign label range
Preview QR labels
Print stickers
Reprint damaged labels
```

Each label includes:

```text
Arsemia logo
Job ID
Customer name or initials
Item number
Short item name
QR code
Optional unit/status
```

QR payload example:

```json
{
  "type": "storage_item",
  "jobId": "JOB-1234",
  "storageItemId": "STI-uuid",
  "labelNumber": 24,
  "checksum": "generated-checksum"
}
```

## 7.10 Scan Sessions

Scan session types:

```text
Pickup Inventory
Truck Load
Storage Receiving
Storage Audit
Pull From Storage
Load For Delivery
Customer Delivery Check-Off
Final Customer Check-Off
```

Scan session KPIs:

```text
Expected pieces
Scanned pieces
Unchecked pieces
Duplicate scans
Unexpected items
Damaged pieces
Condition changes
Missing pieces
```

Actions:

```text
Scan QR
Manual entry
Mark damaged
Mark missing
Add comment
Take photo
Pause session
Finish session
Generate PDF
Collect signature
```

Duplicate scan behavior:

```text
Duplicate scan detected.
Item #24 TV was already scanned at [time] by [user].
```

Unexpected item behavior:

```text
Unexpected item.
This QR does not belong to this job/session.
```

Missing item behavior:

```text
Unchecked items:
#24 TV
#27 Stool
#30 Dresser
```

## 7.11 Chain of Custody / Item Detail

Each item must have a timeline:

```text
Created from quote inventory
Label printed
Picked up by foreman
Loaded to truck
Received at storage
Audited
Pulled for delivery
Loaded for delivery
Delivered to customer
Claim opened/resolved if applicable
```

Each event stores:

```text
eventType
timestamp
userId
role
location
condition
photoIds
comments
signatureId
scanSessionId
```

## 7.12 PDFs / documents

Documents to generate:

```text
Pickup Inventory PDF
Storage Receiving PDF
Storage Audit PDF
Storage Pull-Out PDF
Delivery Bingo PDF
Final Customer Check-Off PDF
Missing/Damaged Items Report
Blanket Ledger Report
Customer Storage Statement
Storage Billing Reminder
```

PDF must include:

- Client/customer
- Job ID
- Ref #
- Date/time
- Address/storage location
- Total expected pieces
- Checked pieces
- Unchecked pieces
- Damaged pieces
- Duplicate scans
- Unexpected items
- Table of items
- Condition
- Time scanned
- Comments
- Photos if available
- Signatures
- Disclaimer

Real reference:

The current Bingo Summary reference shows 44 total pieces in origin inventory, 44 checked pieces, 0 unchecked, 0 damaged, timestamps per ID, and foreman/customer signatures.

## 7.13 Customer Portal View

Customer should see a clean version:

```text
Your items are in storage
Item count
Storage status
Payment due
Documents
Request delivery out
Claims if any
```

Customer should not see:

```text
Internal notes
Payroll issues
Foreman disputes
Blanket mismatch
Storage access codes
Internal claim strategy
```

---

# 8. LABELS / QR / SCAN DATA CONTRACT

```json
{
  "StorageItem": {
    "id": "STI_uuid",
    "jobId": "JOB_uuid",
    "customerId": "CUS_uuid",
    "storageJobId": "STJ_uuid",
    "unitId": "UNIT_uuid",
    "labelNumber": 24,
    "qrCode": "ARSEMIA-JOB-1234-ITEM-024",
    "itemName": "TV",
    "normalizedItemType": "tv",
    "room": "Living Room",
    "conditionIn": "intact",
    "currentCondition": "intact",
    "currentStatus": "in_storage",
    "currentLocationType": "storage_unit",
    "currentLocationId": "UNIT_B114",
    "blanketsAssigned": 2,
    "lastScannedAt": "2026-07-07T19:27:00",
    "lastScannedBy": "FM-1042",
    "claimId": null,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "StorageScanSession": {
    "id": "SSN_uuid",
    "type": "storage_receiving",
    "jobId": "JOB_uuid",
    "storageJobId": "STJ_uuid",
    "unitId": "UNIT_uuid",
    "startedBy": "USER_uuid",
    "startedAt": "timestamp",
    "completedAt": "timestamp_or_null",
    "expectedCount": 44,
    "scannedCount": 44,
    "uncheckedCount": 0,
    "duplicateCount": 0,
    "unexpectedCount": 0,
    "damagedCount": 0,
    "status": "completed",
    "pdfDocumentId": "DOC_uuid"
  },
  "StorageScanEvent": {
    "id": "EVT_uuid",
    "sessionId": "SSN_uuid",
    "storageItemId": "STI_uuid",
    "labelNumber": 24,
    "scanResult": "checked",
    "condition": "intact",
    "timestamp": "timestamp",
    "scannedBy": "USER_uuid",
    "locationType": "storage_unit",
    "locationId": "UNIT_B114",
    "isDuplicate": false,
    "isUnexpected": false,
    "isMissing": false,
    "comments": "",
    "photoIds": []
  }
}
```

Enums:

```text
scanSessionType:
- pickup_inventory
- truck_load
- storage_receiving
- storage_audit
- pull_from_storage
- load_for_delivery
- customer_delivery_checkoff
- final_customer_checkoff

scanResult:
- checked
- duplicate
- unexpected
- missing
- damaged
- condition_changed
- manual_entry

storageItemStatus:
- expected
- label_printed
- picked_up
- loaded_to_truck
- received_in_storage
- in_storage
- pulled_for_delivery
- loaded_for_delivery
- delivered
- missing
- damaged
- claimed
```

---

# 9. MATERIALS & SUPPLIES SPEC

## 9.1 Placement

Materials & Supplies should live under:

```text
Assets & Inventory
```

or inside Admin/Operations if top-level navigation must stay minimal.

It should not be hidden inside Storage, but it must connect to Storage.

## 9.2 Scope

Materials include:

```text
Tape
Shrink wrap
Moving blankets
Dollies
Straps
TV boxes
Wardrobe boxes
Small boxes
Medium boxes
Large boxes
China boxes
Plastic bins
Packing paper
Uniforms
Tools
Pads
Labels / QR stickers
```

## 9.3 Screens

```text
Materials Dashboard
Material Catalog
Current Stock
Vendor Directory
Purchase Orders
Foreman Requests
Truck Kits
Material Ledger
Uniforms
Payroll Deductions Review
```

## 9.4 Vendor fields

```text
Vendor name
Phone
Address
Materials supplied
Average delivery time
Price list
Notes
Preferred vendor flag
```

## 9.5 Foreman material request

Workflow:

```text
Foreman requests materials
Office approves/issues materials
Foreman receives app notification
Material ledger records transaction
If deductible, payroll review is triggered
```

## 9.6 Truck kits

Each truck has default required supplies.

Example 20ft truck kit:

```text
50 blankets
2 boxes tape
2 shrink wrap
20 medium boxes
4 TV boxes
6 wardrobe boxes
10 dollies
straps
tools
labels/stickers if needed
```

Truck kit audit:

```text
Expected
Actual before route
Issued
Used
Returned
Missing
Damaged
Payroll/material review
```

## 9.7 Storage blanket ledger

This is critical.

Example:

```text
Truck 20ft default: 50 blankets
Storage pickup used: 50 blankets
Storage unit currently holding: 50 blankets
Delivery out expected return: 50 blankets
Returned: 48
Missing: 2
Foreman: Luis Mendoza
Payroll/material review: pending
```

---

# 10. CLAIMS SCALE SPEC

## 10.1 Goal

Claims must scale from a nice mock to a real operational inbox.

Target scale:

```text
1,000+ claims
100+ operators
500+ foremen
multiple customers, foremen and internal teams in each claim
```

## 10.2 Claims queues

```text
Unassigned
Assigned to me
Awaiting customer
Awaiting foreman
Evidence needed
High / urgent
Storage-related
Payroll impact
Insurance review
Ready for resolution
Resolved
Closed
```

## 10.3 Claim ownership

Every claim must have:

```text
Assigned operator
Assigned team
Priority
Status
SLA due date
Amount at risk
Customer
Job
Foreman
Truck
Storage item(s) if applicable
Participants
Watchers
```

## 10.4 Claim thread model

Separate message types:

```text
Internal note
Customer reply
Foreman request
Foreman response
Evidence update
Resolution draft
Final customer response
System event
```

Visibility:

```text
internal_only
customer_visible
foreman_visible
owner_accounting_visible
claims_team_visible
```

## 10.5 Claim detail layout

Main layout:

- Header with claim, customer, amount, priority, SLA
- Conversation/thread center
- Composer with message mode selector
- Evidence panel
- Participants panel
- Connections panel
- Status/assignment panel
- Decision log
- Payroll/finance impact

## 10.6 Transfer/reassign

Claim operator can transfer claim to another handler.

Must record:

```text
old assignee
new assignee
reason
time
actor
```

## 10.7 Final resolution

Resolution can include:

```text
Denied
Approved payout
Customer credit
Repair scheduled
Insurance review
Foreman deduction review
No action / pre-existing damage
```

High-risk financial/legal decisions require approval.

---

# 11. SETTINGS / INTEGRATIONS / USERS / ROOM TEMPLATES

## 11.1 Settings IA

Settings should not be a random list. It should be structured as admin configuration.

Tabs/sections:

```text
Account
Company Profile
Service Areas & Markets
Calculator & Pricing
Catalog & Room Templates
Users & Access
Roles & Permissions
Integrations
Automation Rules
Security & Compliance
Audit Log
Appearance
```

## 11.2 Privacy & Data

Move under:

```text
Security & Compliance
```

Includes:

```text
Data retention
Deleted users
Export data
Access logs
Legal/tax retention
Privacy controls
```

## 11.3 Integrations

Integrations must be structured by time/status.

Tabs:

```text
Active
Available
Planned
Future / Vision
API Keys & Webhooks
Logs
```

Categories:

```text
Communication: SMS, Email, Voice, WhatsApp
AI Agents: Intake, Sales, Follow-up, Claims, Video Inventory
Operations: Maps, Routing, Calendar, GPS
Finance: Stripe, ACH, Zelle placeholder, QuickBooks
Storage: File/photo storage, document signing, QR labels
Automation: Webhooks, Rules Engine, Workflow Canvas
```

Statuses:

```text
Active
Configured
Needs setup
Planned
Blocked by backend
Future
```

## 11.4 Users & Access

Backend required for:

```text
password reset
email verification
active sessions
2FA
server-side role enforcement
audit logs
account recovery
```

Do not fake password changes in localStorage.

## 11.5 Room Templates

Room templates must connect to Quote Builder.

Example:

```text
2 Bedroom Apartment
Estimated CuFt: 550–850
Suggested boxes: 40
Rooms: Bedroom 1, Bedroom 2, Living Room, Kitchen, Dining, Misc
Suggested items: 2 Queen beds, 2 dressers, 4 nightstands, sofa, coffee table, TV, dining table, chairs, boxes
```

Workflow:

```text
Customer says “2 bedroom apartment”
Seller applies template
Quote draft creates editable room/item inventory
Seller/customers adjust
Quote calculated
```

Acceptance:

- Template can be applied to quote.
- Items appear in quote builder.
- CuFt range appears.
- Boxes appear.
- Seller can edit.
- Custom items go to catalog approval flow.

## 11.6 Service Areas & Markets

Replace decorative Work Zone with real Service Areas & Markets.

Fields:

```text
Market name
Zip codes
City/region
Base/truck yard
Service status
Travel fee rules
Lead routing rules
Dispatch zone
LD pricing rules
```

---

# 12. SCALABILITY / QUERY / CACHE / ASYNC / TESTING

## 12.1 Core reality

A prototype can load everything client-side.

A real system cannot.

ArsemiaOS must be designed for:

```text
1,000+ users
500+ foremen
100+ operators/admins
100,000+ leads
50,000+ jobs
500,000+ storage items
100,000+ scan events
10,000+ claims
large payroll history
large activity logs
```

## 12.2 Query architecture rules

Every large module must define:

```text
server-side pagination
server-side filtering
server-side sorting
search indexes
saved views
role-based queries
query limits
loading states
empty states
background processing
cache invalidation
```

## 12.3 Claims query contract

```json
{
  "module": "claims",
  "defaultPageSize": 50,
  "filters": [
    "status",
    "priority",
    "assignedTo",
    "source",
    "customerId",
    "jobId",
    "foremanId",
    "dateRange",
    "slaStatus",
    "hasEvidence",
    "payrollImpact",
    "storageRelated"
  ],
  "sortOptions": [
    "priority_desc",
    "created_desc",
    "sla_due_asc",
    "amount_at_risk_desc"
  ],
  "indexesNeeded": [
    "status_assignedTo_createdAt",
    "priority_slaDueAt",
    "customerId",
    "jobId",
    "foremanId"
  ]
}
```

## 12.4 Storage inventory query contract

```json
{
  "module": "storageInventory",
  "defaultPageSize": 100,
  "filters": [
    "providerId",
    "facilityId",
    "unitId",
    "customerId",
    "jobId",
    "status",
    "condition",
    "room",
    "scanSessionId",
    "hasException",
    "hasClaim"
  ],
  "searchFields": [
    "qrCode",
    "labelNumber",
    "itemName",
    "customerName",
    "jobId",
    "unitNumber"
  ],
  "indexesNeeded": [
    "qrCode_unique",
    "jobId_labelNumber_unique",
    "unitId_status",
    "customerId_status",
    "lastScannedAt"
  ]
}
```

## 12.5 Leads query contract

```json
{
  "module": "leads",
  "defaultPageSize": 50,
  "filters": [
    "status",
    "assignedSellerId",
    "source",
    "market",
    "moveDateRange",
    "leadScore",
    "slaStatus",
    "untouchedForMinutes"
  ],
  "sortOptions": [
    "created_desc",
    "lead_score_desc",
    "sla_due_asc",
    "move_date_asc"
  ]
}
```

## 12.6 Background jobs

Run these asynchronously:

```text
PDF generation
large inventory imports
video/audio transcription
AI item extraction
analytics aggregation
bulk notifications
claim document processing
storage scan reconciliation
affiliate payout calculations
payroll audit calculations
mass lead assignment
```

## 12.7 Cache strategy

```text
Short-lived UI cache for selected pages
Server query cache for dashboard stats
Event-driven invalidation
Background refreshed reports
Optimistic updates only for safe actions
No optimistic update for payments, claims resolution, payroll deductions, refunds, final cancellations
```

## 12.8 Load testing

Future tools:

```text
k6
Playwright
Lighthouse
Artillery
```

Test scenarios:

```text
100 users searching claims
50 foremen scanning items
20 operators assigning leads
1000 storage items loaded in unit detail
500 claims filtered by SLA
100 sellers receiving lead assignments
bulk PDF generation after scan sessions
```

---

# 13. BACKEND TARGET ARCHITECTURE

## 13.1 Current problem

Current app relies on localStorage/Zustand. This is okay for demo, not production.

Production requires:

```text
Backend
Database
Auth
Roles server-side
Audit logs
API/server actions
File storage
Background jobs
Email/SMS providers
Payment integrations
```

## 13.2 Recommended stack

Recommended direction:

```text
Next.js App Router
Postgres
Prisma or Drizzle
Server Actions / API routes
Auth.js / Clerk / Supabase Auth depending final decision
S3/R2 storage for documents/photos
Queue/background jobs later: Inngest, Trigger.dev, BullMQ, or managed queues
```

Supabase is attractive for speed, auth, Postgres, storage and real-time, but vendor lock-in must be understood.

Prisma + Postgres gives strong control but requires more backend setup.

Decision can be delayed until after current frontend consolidation.

## 13.3 Backend phases

Phase 0:

- Consolidate frontend architecture
- Define data contracts
- Remove decorative routes
- Prepare backend-ready stores/services

Phase 1:

- Auth + Users + Roles
- Postgres schema
- Customers/Leads/Quotes/Jobs persisted
- Server-side query layer

Phase 2:

- Storage, scan sessions, documents
- Claims ownership and threads
- Payroll and Finance persistence

Phase 3:

- Integrations
- Automation Center
- AI Agents
- Customer portal
- Affiliate portal

---

# 14. AUTOMATION CENTER / AI AGENTS / GROWTH ENGINE

## 14.1 Automation Center goal

Automation Center is the rules engine for ArsemiaOS.

It should eventually support:

```text
Trigger → Condition → Action → Approval Gate → Activity Log
```

Examples:

```text
New lead created → assign to available seller → start SLA timer
Lead untouched for 10 minutes → notify owner / reassign
Quote accepted → create job → notify dispatch
Foreman time off approved → block assignment
Storage item damaged → create exception and claim draft
Claim opened → payroll review flag
Invoice overdue → notify accounting/customer
Truck over capacity → block or require approval
```

## 14.2 Automation rules data shape

```json
{
  "id": "AUTO-LEAD-001",
  "name": "Assign new lead to available seller",
  "trigger": "lead.created",
  "conditions": [
    { "field": "lead.status", "operator": "equals", "value": "new" },
    { "field": "seller.available", "operator": "equals", "value": true },
    { "field": "seller.activeLeadCount", "operator": "lt", "value": 15 }
  ],
  "actions": [
    { "type": "assign_lead", "strategy": "lowest_workload" },
    { "type": "notify", "roles": ["Seller"] },
    { "type": "start_timer", "durationMinutes": 5 }
  ],
  "approvalRequired": false,
  "activityLog": true
}
```

## 14.3 AI Agent Layer

AI agents are future integrations, not current core.

Agents:

```text
AI Intake Agent
AI Sales Assistant
AI Follow-Up Agent
AI Dispatch Assistant
AI Claims Assistant
AI Storage Assistant
AI Video/Audio Inventory Agent
```

Allowed AI actions:

```text
collect information
transcribe
structure inventory
create drafts
recommend
remind
escalate
summarize
```

Forbidden without human approval:

```text
final price
guaranteed availability
refunds
claim decisions
payroll deductions
legal promises
large discounts
final job cancellation
```

## 14.4 Video/audio inventory intake

Workflow:

```text
Customer sends video/audio
AI extracts audio
Transcribes
Detects items
Groups by room
Estimates rough CuFt
Marks uncertain items
Generates inventory draft
Sends confirmation list to customer
Seller reviews
Quote Builder imports confirmed list
```

Customer message example:

```text
Please send a quick video walking through the items you want to move. While recording, say each item out loud: queen bed, dresser, two nightstands, 55-inch TV, sofa, dining table. We will send you back a list to confirm before preparing the quote.
```

## 14.5 Affiliate / Referral Growth Engine

Future module.

Features:

```text
Referral links
Influencer codes
Affiliate dashboard
Lead status tracking
Booking/payment tracking
Commission pending/approved/paid
Fraud prevention
Seller training scripts
Campaign analytics
```

Commission stages:

```text
Lead submitted
Qualified
Quoted
Booked
Completed
Paid
Commission approved
Commission paid
Rejected / invalid
```

## 14.6 Field Growth / Foreman Academy

Future module.

Ranks:

```text
Helper
Certified Helper
Lead Helper
Junior Foreman
Foreman
Senior Foreman
Contractor Foreman
Trainer Foreman
```

Recruitment/override model:

```text
Senior foreman recruits helper
Helper completes training
Helper becomes lead helper
Lead helper becomes junior foreman
Recruiter earns override for X jobs or X months if performance quality is met
```

Metrics:

```text
damage rate
claims rate
customer rating
attendance
on-time rate
revenue handled
training completed
safety incidents
```

---

# 15. CLAUDE WORKFLOW / SKILLS / PONYTAIL

## 15.1 Tool roles

```text
ChatGPT = product architect, auditor, spec writer, prompt pack author
Claude Code = implementation agent inside repo
GitHub = version control
Tests/build/lint = verification
Ponytail = code-bloat/review tool, not main architect
```

## 15.2 Ponytail usage

Ponytail may be useful for:

```text
code audit
bloat review
dead code detection
overengineering review
simplification pass
route/module bloat review
```

Do not use Ponytail to delete required business logic.

Do not use ultra-simplification mode on complex product architecture.

## 15.3 Subagents

Use subagents/reviewers after a sprint:

```text
UX reviewer
Data architecture reviewer
Security reviewer
Performance reviewer
QA/test reviewer
Code bloat reviewer
```

Subagents do not replace actual tests.

---

# 16. MASTER CATALOG SEED

The following item list from Voxme/POC should become a normalized seed catalog for Quote Builder, Storage Inventory, QR labels, scan sessions and room templates.

Tasks for this catalog:

1. Deduplicate variants.
2. Normalize naming.
3. Add category.
4. Add default CuFt.
5. Add fragility.
6. Add specialty handling flag.
7. Add disassembly flag.
8. Add storage allowed flag.
9. Add aliases.
10. Allow company overrides.

Raw seed list:

```text
AC
Accent Chair
Accent Table
Adjustable Bed
Air Conditioner
Air Mattress
Air Purifier
Amplifier
Aquarium
Arm Chair
Armchair
Armoir 2 doors
Armoir 2 doors Glass
Armoir 3 doors
Armoir 3 doors Glass
Baby Bath
Baby Crib
Baby Crib Part
Baby Swing
Backpack
Bag
Baking oven
Bar
Bar Cart
Bar Stool
Barrel
Basket
Bassinet
Bath Shelf
Bathtub
BBQ
BBQ big
Beanbag
Bed
Bed Part
Bed, Water Bed
Bedding
Bedside Table
Bench
Bicycle Rack
Bicycle, Adult
Bicycle, Child
Bike Stand
Bin
Blackboard
Bookcase
Box
Box Spring
Brooms, etc.
Bucket of paint
Buffet
Buffet Top
Bunk Bed
Bureau
Cabinet
Cabinet Corner
Cabinet top
Cabinet, glass
Cage
Camping Gear
Candle Stand
Canoe
Canva
Car
Car Seat
Carpet
Cart
CD Rack
Ceiling Lamp
Chainsaw
Chair
Chair Recliner
Chair, Folding
Chair, Office
Chair, Rocking
Chaise Longue
Chandelier
Changing Table
Chest
Chest of Drawers
Chestboard
Chimney
Chimney Set
China Cabinet 1 piece
China Cabinet 2 pieces
China Cabinet 3 pieces
Christmas Tree
Cleaner
Cleaning supplies
Clock
Coat Rack
Coffee Table
Coffeemaker
Computer
Computer Monitor
Console Table
Cool Box
Cooler
Copy machine, big
Couch Element
Couch, 2 Seater
Couch, 3 Seater
Couch, 4 Seater
Credenza
Cube Shelf
Cuckoo Clock
Cupboard
Curtain Rod
Curtains
Cushions
Dehumidifier
Desk
Desk chair
Desk Part
Desk Top
Desk w/hutch
Dishwasher
Dog Basket
Dog Crate
Dog Crate Part
Dog Kennel
Dolley
Dollhouse
Drawer
Dresser
Dresser Double
Dresser Mirror
Dresser Table
Dresser Tripple
Dresser w/mirror
Dressing Table
Drum Kit
Dry rack
Dryer
Easel
Electric Bicicle
Eliptical Machine
Entertainment Center
Entryway Table
Exercise Bike
Exercise Machine
Fan
File Cabinet
Fireplace
Fish Rods
Flower Pot
Folding Chair
Folding Table
Footbard
Freezer
Fridge
Futton
Garden Bench
Garden Tools
Garden, Sunbed
Glass
Glass Top, large
Golf Trolley
Golfbag
Grandfather Clock
Guitar
Gun
Hammock
Hammock-Stand
Hamper
Hand Barrow
Hangers
Hardware
Hardware Box
Headboard
Heater
HHG
HiFi System
High Chair
Hose
Household Items
Ironing Board
Island Chair
Jewel Case
Jewelry
Keyboard
Kitchen hood
Ladder
Lamp, Hanging
Lamp, Standing
Lamp, Table
Lamp, wall fixed
Lampshade
Lantern
Laundry Rack
Lawn Mower
Litter Box
Loft Bed
Love Seat, 2-seater
Magazine Rack
Mannequin
Massage Chair
Mattress
Microwave
Mirror
Miscellaneous
Monitor
Motor Bike
Music Instrument
Night stand
Office Chair
Organ
Ottoman
Outdoor Chair
Pad
Paravent
Patio Chair
Patio table
Peloton
Piano Stool
Piano, Baby Grand
Piano, Electric
Piano, Grand
Piano, Upright
Picture
Pillows
Plant
Plants
Plastic Bin
Plastic Box
Platner
Playpark
Pool Equipment
Pool Table
Porch Swing
Portfolio Case
Pot Plants
Pouf
Pressure Washer
Printer
Projecter
Punching Bag
Rack
Radiator
Recliner Part
Refrigerator
Refrigerator US
Refrigerator, Wine
Rocking Horse
Roof Box car
Room Divider
Rowing Machine
Rucksack
Rug
Saddle
Safe
Sand Pit
Satelite Dish
Sauna
Scooter
Scooter, push
Screws
Sculpture
Sewing Cart
Sewing Machine
Sewing Table
Sheets
Shelf
Shelf, dismantled
Shelving Unit
Shoe Cupboard
Shoe Rack
Shredder
Side Table
Sideboard
Ski(s)
Slatted Frame
Sledge
Small Stand
Snowboard
Sofa 3 seat
Sofa Bed, 2-seater
Sofa Bed, 3-seater
Sofa Chair
Sofa L-Shape
Sofa Part
Sound bar
Speaker
Sports Equipment
Spring box
Standing Lamp
Statue
Steamer
Step Master
Stool, small
Storage Bed
Stove
Stroller
Stroller Baby
Suitcase
Suitrack
Sunshade
Sunshade stand
Surfboard
Swing Set
Table
Table part
Table, ping pong
Table, Side
Tabletop
Telescope
Tent
Termomix/kitchenaid
Therapy Lamp
Tires
Toolbox
Tools
Total Gym
Towel Rack
Toy Kitchen
Toy Work Bench
Trampoline, dismantled (org.)
Trashcan
Treadmill
Tricycle
Trunk
TV
TV Cabinet
TV part
TV Stand
Umbrella
Umbrella Stand
Uniform
Vacuum Cleaner
Vanity
Vase
Walker
Walking Pad
Wall shelf
Wardrobe
Washing Machine
Weapon Cupboard
Weight Bench
Whiteboard
Wicker Basket
Wicker Coofe Table
Wicker Love Seat Part
Wine Rack
Work Bench
```

---

# 17. SPRINT EXECUTION ORDER

## Sprint 0 — Repo audit, no coding

Input:

- Section 1
- Section 2
- Section 3
- Section 4
- Section 12

Output from Claude:

- Route inventory
- Duplicate module map
- Sidebar/workspace proposal
- Dead/decorative page list
- Store/data overlap list
- First sprint plan
- Files affected
- Risks

No code.

## Sprint 1 — Information Architecture cleanup

Goals:

- Consolidate sidebar.
- Introduce workspaces.
- Hide/remove duplicate top-level routes.
- Move Routes into Operations.
- Move Invoices/Expenses/Payroll into Finance.
- Move Privacy under Security & Compliance.
- Keep functionality reachable through tabs.

No Storage rebuild yet.

## Sprint 2 — Operations Control consolidation

Goals:

- Create Operations Control workspace.
- Integrate Dispatch Board.
- Integrate Routes/Schedule.
- Integrate Foreman daily roster.
- Integrate truck assignment.
- Fix DateNavigator.
- Fix Foremen on duty CSS.

## Sprint 3 — Finance workspace and payroll correction

Goals:

- Create Finance workspace.
- Move payroll/invoices/expenses under Finance.
- Simplify payroll statement.
- Add previous/next payroll period.
- Add filters/sorting.
- Add real payroll seed.
- Hide payroll tools under Audit Tools.

## Sprint 4 — Storage design only

Goals:

- Do not code full Storage yet.
- Design exact screens.
- Design entity model.
- Design query contracts.
- Design PDF templates.
- Design QR scan sessions.
- Return implementation plan.

## Sprint 5 — Storage Command Center + Calendar + Units Map

Goals:

- Command Center KPIs.
- Storage Calendar.
- Unit grid/map.
- Unit detail shell.
- No QR yet unless planned.

## Sprint 6 — Storage Inventory + Labels + QR + Scan Sessions + PDFs

Goals:

- Item-first inventory.
- Label printing.
- QR payloads.
- Scan sessions.
- Duplicate/unexpected/missing logic.
- PDF generation shell.
- Signature placeholders.

## Sprint 7 — Claims scale-up

Goals:

- Operators.
- Assigned ownership.
- Transfer/reassign.
- Queues.
- SLA.
- Internal/customer/foreman threads.
- Evidence and final resolution.

## Sprint 8 — Scalability architecture pass

Goals:

- Query contracts.
- Server-ready data services.
- Pagination/filtering/sorting interfaces.
- Cache invalidation notes.
- Background job boundaries.
- Load test plan.

## Sprint 9 — Automation and AI planning only

Goals:

- Do not implement agents yet.
- Define Automation Center data model.
- Define AI agent permissions.
- Define integration settings.
- Define human approval gates.

---

# 18. PROMPT P1 — INFORMATION ARCHITECTURE CLEANUP

```text
You are now allowed to implement Sprint 1 only: Information Architecture Cleanup.

Goals:
- Reduce sidebar bloat.
- Consolidate duplicate modules into workspaces.
- Do not delete useful functionality without preserving it as a tab or sub-route.
- Create/adjust target structure:
  Dashboard
  Sales
  Operations
  Jobs
  Storage
  Finance
  Claims
  Reports
  Growth (placeholder only if already useful)
  Admin

Specific moves:
- Routes & Schedule should live under Operations, not as a duplicate top-level workflow.
- Invoices, Expenses and Payroll should live under Finance.
- Privacy & Data should move under Security & Compliance.
- Payroll tools should be hidden under Finance → Payroll → Audit Tools or removed from primary flow.
- Do not rebuild Storage yet.
- Do not build Automation Center yet.
- Do not build AI agents yet.

Deliverables:
1. List files changed.
2. Explain routing/sidebar changes.
3. Confirm all previous pages remain reachable where appropriate.
4. Run typecheck/lint/build.
5. Provide manual smoke test URLs.

Acceptance criteria:
- Sidebar is simpler.
- Duplicate workflows are reduced.
- No broken navigation.
- No decorative new pages.
- Existing data still renders.
```

---

# 19. PROMPT P2 — OPERATIONS CONTROL CONSOLIDATION

```text
Implement Sprint 2: Operations Control consolidation.

Build/adjust a unified Operations Control workspace with tabs:
- Dispatch Board
- Schedule / Routes
- Foreman Roster
- Truck Assignment
- Capacity & Load
- Map / Live View
- Alerts

Requirements:
- Reuse useful pieces from existing /dispatch, /routes, /foremen and /fleet.
- Fleet remains asset management, not daily dispatch.
- Foremen remains people/profile management, not only daily roster.
- Fix the Dispatch date strip so it is full-width, balanced and reusable.
- Fix Foremen on duty card clipping/cutoff.
- Shared selected date state across Operations tabs.
- Do not create duplicate stores if an existing store can be consolidated.

Acceptance criteria:
- /operations or equivalent workspace opens.
- Dispatch Board tab shows queue + selected job + map + roster.
- Schedule tab shows route/foreman grouping for selected day.
- Foreman Roster tab shows operational availability.
- Truck Assignment tab shows daily trucks and capacity.
- No CSS clipping in right panel.
- Typecheck/lint/build pass.
```

---

# 20. PROMPT P3 — STORAGE DESIGN ONLY

```text
Implement Sprint 4: Storage design only. Do not code UI yet unless explicitly approved.

Read the Storage OS sections of this master pack.

Return:
1. Proposed Storage route structure.
2. Screen-by-screen UI plan.
3. Data entity model.
4. Query contracts.
5. QR/label strategy.
6. Scan session workflow.
7. PDF/document templates.
8. Roles and permissions.
9. Risks.
10. First implementation sprint for Storage.

Do not implement the Storage rebuild in this step.
```

---

# 21. PROMPT P4 — STORAGE IMPLEMENTATION

```text
Implement the first approved Storage implementation sprint only.

Scope:
- Storage Command Center
- Storage Calendar
- Units & Map
- Unit Detail shell

Do not implement full QR scanning yet unless approved.
Do not implement customer portal yet.
Do not implement Materials & Supplies yet.

Use the Storage OS spec.

Acceptance criteria:
- Storage Command Center answers what enters, leaves, expires, is overdue and needs attention.
- Calendar uses color-coded activity.
- Units & Map shows unit status, capacity, customers, items, billing and exceptions.
- Unit detail uses tabs and compact inventory shell.
- No giant item cards for hundreds of items.
- Typecheck/lint/build pass.
```

---

# 22. PROMPT P5 — CLAIMS SCALE-UP

```text
Implement Claims Scale-Up sprint.

Goals:
- Add assigned operator/handler ownership.
- Add transfer/reassign claim flow.
- Add queues: unassigned, assigned to me, awaiting customer, awaiting foreman, evidence needed, high risk, storage-related, payroll impact.
- Add participants/watchers panel.
- Separate message visibility: internal, customer, foreman, system.
- Add SLA due date and priority.
- Add final resolution workflow shell.

Do not fake external email/SMS sending.
Do not make final financial/legal decisions automatic.

Acceptance criteria:
- A claim can be assigned to an operator.
- A claim can be transferred with reason logged.
- Internal notes are visually separate from customer/foreman messages.
- Claim list can filter by queue/status/assigned operator.
- Detail page shows participants and connections.
- Typecheck/lint/build pass.
```

---

# 23. PROMPT P6 — SCALABILITY / QUERY / CACHE PASS

```text
Implement a scalability architecture pass without changing product behavior unnecessarily.

Goals:
- Identify modules that load/filter large arrays client-side.
- Introduce backend-ready query service interfaces.
- Add query contracts for Claims, Storage, Leads, Jobs, Payroll, Activity Log.
- Prepare pagination/filter/sort state objects.
- Mark localStorage/Zustand as prototype storage only.
- Define cache invalidation comments/contracts for future backend.
- Define background job boundaries for PDFs, AI, reports, bulk notifications and scan reconciliation.

Do not build a backend yet unless explicitly approved.
Do not overengineer UI.

Acceptance criteria:
- Query contracts exist in code/docs.
- Large modules have pageSize/filter/sort/search patterns.
- No new decorative UI.
- Typecheck/lint/build pass.
```

---

# 24. PROMPT P7 — PONYTAIL REVIEW AFTER SPRINT

```text
Use Ponytail/review mindset as a post-sprint audit only.

Review the latest sprint for:
- dead routes
- duplicate workflows
- unused components
- decorative buttons
- overengineering
- excessive abstraction
- code that does not support product requirements
- large files that should be split

Do not delete business logic just because it is complex.
Do not simplify away required workflows.
Return a list of safe removals and risky removals separately.
Wait for approval before deleting code.
```

---

# 25. FINAL ACCEPTANCE CRITERIA FOR THE NEXT PHASE

The next phase is successful only if:

```text
1. Sidebar is simpler.
2. Dispatch/Routes/Foremen daily operations are consolidated.
3. Fleet becomes asset management, not duplicate dispatch.
4. Finance consolidates Invoices/Expenses/Payroll.
5. Payroll real seed is included and displayed cleanly.
6. Payroll page has previous/next period navigation.
7. Claims has operator assignment and transfer/reassign workflow.
8. Storage has a clear design plan before more implementation.
9. Query/cache/scalability strategy is present.
10. No new decorative pages are added.
11. Build, lint and typecheck pass.
12. Claude provides a final report after each sprint.
```

---

# 26. WHAT NOT TO BUILD YET

Do not build these until core consolidation is stable:

```text
Full AI voice agent
Full Automation Canvas
Affiliate portal
Customer portal full version
Full backend migration
Full QR mobile scanner
Full warehouse material procurement system
Full Foreman Academy
Full load testing suite
```

These are real future modules, but building them before consolidation will create more bloat.

---

# 27. MANUAL NOTE FOR YEISON

This file is meant to be edited. Add your future notes directly under the relevant section.

Use this workflow:

1. Update this file.
2. Copy only the relevant section to Claude.
3. Ask Claude for no-coding audit first.
4. Approve one sprint.
5. Test locally.
6. Bring screenshots/findings back for review.
7. Run Ponytail-style bloat review after each sprint.

Roma ladrillo por ladrillo. But every brick must connect to the operating system vision.


---

# 28. DETAILED SCREEN BLUEPRINTS

This section makes the product concrete. Claude should not invent screens from vague ideas. Each screen must have purpose, primary user, data shown, primary actions, and what must not appear there.

## 28.1 Dashboard / Command Center

Purpose: morning control room. It should not be a generic analytics page.

Primary users:
- Owner
- Dispatcher
- Accounting
- Claims manager
- Seller manager

Must show:
- Jobs today
- Unassigned jobs
- Jobs at risk
- Foremen on duty
- Trucks available
- Trucks in shop
- Open claims
- Claims awaiting response
- Invoices overdue
- Payroll flags
- Expenses pending review
- Storage entering/leaving/overdue
- Low material stock
- Lead SLA alerts

Must not show:
- audit noise such as role switched
- decorative charts without actions
- every event in the system

Primary actions:
- Open Operations Control
- Open unassigned jobs
- Open claims needing response
- Open overdue invoices
- Open storage issues
- Open payroll flags

Acceptance:
- Every dashboard card opens the exact record or filtered list.
- Repeated alerts are grouped.
- The dashboard is role-aware.

## 28.2 Sales Workspace

Tabs:
- Pipeline
- Leads
- Quotes
- Customers
- Seller Workload
- Templates

### Pipeline tab

Purpose: visual status flow.

Stages:
- New
- Contacted
- Details Needed
- Quote Draft
- Quote Sent
- Follow-up
- Booked
- Lost

Rules:
- Pipeline is not the lead database.
- Pipeline cards should open Lead Detail.
- Bulk assignment should be possible for Owner/Sales Manager.

### Leads tab

Purpose: searchable/filterable lead database.

Columns:
- Lead name
- Contact
- Source
- Assigned seller
- Move date
- Market
- Status
- SLA status
- Last contact
- Value/risk score

Filters:
- assigned to me
- unassigned
- untouched for X minutes
- source
- market
- move date
- status
- high value

Actions:
- assign/reassign seller
- create quote draft
- send inventory request
- send video instructions
- mark lost
- log call

### Lead Detail

Must include:
- customer/contact info
- source/referral/affiliate
- move details
- addresses
- inventory draft
- notes
- activity log
- seller ownership
- SLA timer
- quote draft creation

Critical rule:
- Create Quote from Lead must prefill the quote. It must not open an empty quote.

### Quotes

Quote Builder modes:
- Manual item entry
- Paste item list
- Room template
- Import from video/audio intake draft
- Import from lead details

Quote must connect to:
- Customer
- Lead
- Job when booked
- Catalog items
- Custom item approvals

## 28.3 Jobs Workspace

Purpose: job record is the center of the system.

Job connects:
- Customer
- Lead
- Quote
- Dispatch
- Route
- Foreman
- Truck
- Inventory
- Documents
- Storage
- Claims
- Invoice
- Expenses
- Payroll
- Activity Log

Job Detail tabs:
- Overview
- Dispatch
- Inventory
- Documents
- Storage
- Claims
- Invoice
- Payroll
- Activity
- Notes

Job Closeout checklist:
- Job completed
- Customer signed
- Invoice paid or payment status known
- Claims none or resolved/linked
- Expenses reviewed
- Payroll calculated
- Documents archived
- Storage state closed if applicable

## 28.4 Storage Command Center Blueprint

Layout:

Header:
- title
- search by customer/job/QR/unit/item
- provider filter
- status filter
- date range

KPI row:
- Active storage jobs
- Items in storage
- Entering today
- Leaving today
- Expiring soon
- Overdue
- Open exceptions
- Blankets outstanding
- Billing due

Main left:
- Calendar or daily activity list

Main center:
- Unit map/section overview preview

Main right:
- Needs Attention

Bottom:
- Recent scan sessions
- Recent documents
- Open exceptions

## 28.5 Storage Unit Map Blueprint

Purpose: fast visual understanding of third-party storage units.

Hierarchy:
- Provider
- Facility
- Floor/section if available
- Unit

Unit tile fields:
- unit number
- capacity %
- item count
- customer count
- billing status
- claim/exception indicator
- blankets trapped
- last audit

Unit tile colors:
- green: healthy
- yellow: nearing full/expiring
- red: overdue/action required
- gray: empty
- purple: mixed/split customer/special handling
- blue: audit scheduled

Click behavior:
- Opens Unit Detail.

## 28.6 Storage Scan Screen Blueprint

This screen must be optimized for field speed.

Header:
- session type
- customer
- job
- expected/scanned/unchecked/duplicates/unexpected/damaged

Primary controls:
- big Scan QR button
- manual number entry
- mark damaged
- add photo
- finish session

Item list tabs:
- All
- Scanned
- Unchecked
- Damaged
- Duplicate
- Unexpected

When scan occurs:
- If expected and not scanned: mark checked.
- If already scanned: duplicate warning.
- If belongs to another job/session: unexpected warning.
- If label unknown: manual review.

Finish session requires:
- unresolved missing confirmation
- damaged item review
- signatures if required
- PDF generation

## 28.7 Finance Workspace Blueprint

Finance Overview:
- money coming in
- money going out
- payroll status
- overdue invoices
- pending expenses
- pending deductions
- pending reimbursements
- storage billing

Invoices tab:
- status filters
- overdue
- paid
- draft
- customer
- job
- amount
- due date

Expenses tab:
- pending approval
- missing receipt
- duplicate suspected
- reimbursable
- payroll-linked
- vendor/material category

Payroll tab:
- weekly periods
- foreman/helper summaries
- approve/flag
- deductions/reimbursements
- audit flags

Audit Tools tab:
- owner/accounting only
- not primary sidebar

## 28.8 Claims Inbox Blueprint

Claims list layout:
- queue tabs
- KPI cards
- search
- filters
- list table

KPI cards:
- Open claims
- Awaiting response
- Unassigned
- High risk
- Amount at risk
- SLA overdue

List columns:
- claim ID
- customer
- issue
- assigned operator
- status
- priority
- amount at risk
- SLA
- source
- last update

Claim detail layout:
- left/main thread
- right control panel
- evidence section
- participants section
- connections section
- decision log

Composer modes:
- internal note
- reply to customer
- request foreman response
- request more evidence
- resolution draft

---

# 29. ENTITY MODEL — EXPANDED BACKEND-READY VERSION

This model is a contract. Current frontend may mock it, but future backend should respect it.

```json
{
  "User": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string|null",
    "roleIds": ["uuid"],
    "status": "active|invited|suspended|deleted",
    "linkedForemanId": "uuid|null",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "lastActiveAt": "datetime|null"
  },
  "Role": {
    "id": "uuid",
    "name": "Owner|Dispatcher|Seller|Accounting|Claims|Marketing|Foreman|Admin",
    "permissions": ["string"]
  },
  "Customer": {
    "id": "uuid",
    "name": "string",
    "email": "string|null",
    "phone": "string|null",
    "source": "string|null",
    "createdFromLeadId": "uuid|null",
    "notes": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "Lead": {
    "id": "uuid",
    "customerId": "uuid|null",
    "assignedSellerId": "uuid|null",
    "source": "website|phone|facebook|google_ads|referral|affiliate|walk_in|repeat_customer|other",
    "status": "new|contacted|details_needed|quote_draft|quote_sent|follow_up|booked|lost",
    "market": "string|null",
    "moveDate": "date|null",
    "pickupAddress": "string|null",
    "deliveryAddress": "string|null",
    "leadScore": "number|null",
    "slaDueAt": "datetime|null",
    "lastContactAt": "datetime|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "Quote": {
    "id": "uuid",
    "leadId": "uuid|null",
    "customerId": "uuid",
    "status": "draft|sent|accepted|rejected|expired|converted_to_job",
    "jobType": "local|long_distance|hourly|pickup|delivery|storage_in|storage_out|packing|loading_unloading|other",
    "estimatedCuFt": "number|null",
    "price": "number|null",
    "adminCharge": "number|null",
    "notesForCustomer": "string|null",
    "notesForForeman": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "QuoteItem": {
    "id": "uuid",
    "quoteId": "uuid",
    "catalogItemId": "uuid|null",
    "name": "string",
    "room": "string|null",
    "quantity": "number",
    "cuFtEach": "number|null",
    "isCustom": "boolean",
    "requiresApproval": "boolean"
  },
  "CatalogItem": {
    "id": "uuid",
    "name": "string",
    "aliases": ["string"],
    "category": "furniture|box|appliance|electronics|outdoor|office|baby|specialty|materials|other",
    "defaultCuFt": "number|null",
    "fragility": "low|medium|high",
    "requiresDisassembly": "boolean",
    "specialHandling": "boolean",
    "storageAllowed": "boolean",
    "active": "boolean"
  },
  "Job": {
    "id": "uuid",
    "jobNumber": "string",
    "customerId": "uuid",
    "quoteId": "uuid|null",
    "leadId": "uuid|null",
    "status": "draft|scheduled|assigned|en_route|pickup_started|pickup_completed|delivery_started|completed|cancelled|closed",
    "jobType": "string",
    "moveDate": "date",
    "pickupAddress": "string",
    "deliveryAddress": "string|null",
    "estimatedCuFt": "number|null",
    "price": "number|null",
    "assignedForemanId": "uuid|null",
    "assignedTruckId": "uuid|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "Foreman": {
    "id": "uuid",
    "userId": "uuid|null",
    "name": "string",
    "phone": "string|null",
    "email": "string|null",
    "status": "available|on_job|en_route|break|offline|time_off|inactive",
    "payoutModel": "crew_30|contractor_33_5|custom",
    "contractorCompany": "string|null",
    "baseLocation": "string|null",
    "currentTruckId": "uuid|null"
  },
  "Vehicle": {
    "id": "uuid",
    "vehicleNumber": "string",
    "name": "string",
    "type": "box_truck|sprinter|cargo_van|pickup|other",
    "capacityCuFt": "number|null",
    "safeRecommendedCuFt": "number|null",
    "status": "active|idle|maintenance|out_of_service",
    "mileage": "number|null",
    "registrationExpiresAt": "date|null",
    "insuranceExpiresAt": "date|null",
    "nextServiceAt": "date|null"
  },
  "StorageProvider": {
    "id": "uuid",
    "name": "string",
    "phone": "string|null",
    "address": "string|null",
    "notes": "string|null"
  },
  "StorageFacility": {
    "id": "uuid",
    "providerId": "uuid",
    "name": "string",
    "address": "string",
    "accessNotes": "string|null"
  },
  "StorageUnit": {
    "id": "uuid",
    "facilityId": "uuid",
    "unitNumber": "string",
    "size": "string|null",
    "monthlyCost": "number|null",
    "capacityCuFt": "number|null",
    "currentFillPercent": "number|null",
    "status": "empty|healthy|near_full|full|overdue|audit_due|special_handling"
  },
  "StorageJob": {
    "id": "uuid",
    "jobId": "uuid",
    "customerId": "uuid",
    "status": "pending_storage_in|in_storage|expiring_soon|overdue|scheduled_out|partial_out|closed|claim_open",
    "storageInDate": "date|null",
    "expectedOutDate": "date|null",
    "actualOutDate": "date|null",
    "billingStatus": "not_started|current|due|overdue|closed",
    "unitIds": ["uuid"],
    "itemCount": "number",
    "blanketsUsed": "number|null"
  },
  "StorageItem": {
    "id": "uuid",
    "storageJobId": "uuid",
    "jobId": "uuid",
    "customerId": "uuid",
    "unitId": "uuid|null",
    "labelNumber": "number",
    "qrCode": "string",
    "itemName": "string",
    "room": "string|null",
    "conditionIn": "intact|scratched|damaged|unknown",
    "currentStatus": "expected|label_printed|picked_up|loaded_to_truck|received_in_storage|in_storage|pulled_for_delivery|loaded_for_delivery|delivered|missing|damaged|claimed",
    "blanketsAssigned": "number|null",
    "lastScannedAt": "datetime|null",
    "lastScannedBy": "uuid|null"
  },
  "StorageScanSession": {
    "id": "uuid",
    "type": "pickup_inventory|truck_load|storage_receiving|storage_audit|pull_from_storage|load_for_delivery|customer_delivery_checkoff|final_customer_checkoff",
    "jobId": "uuid",
    "storageJobId": "uuid|null",
    "unitId": "uuid|null",
    "startedBy": "uuid",
    "startedAt": "datetime",
    "completedAt": "datetime|null",
    "expectedCount": "number",
    "scannedCount": "number",
    "uncheckedCount": "number",
    "duplicateCount": "number",
    "unexpectedCount": "number",
    "damagedCount": "number",
    "pdfDocumentId": "uuid|null"
  },
  "Claim": {
    "id": "uuid",
    "claimNumber": "string",
    "customerId": "uuid",
    "jobId": "uuid|null",
    "foremanId": "uuid|null",
    "truckId": "uuid|null",
    "storageItemId": "uuid|null",
    "assignedOperatorId": "uuid|null",
    "status": "open|pending|awaiting_customer|awaiting_foreman|evidence_needed|under_review|resolved|closed",
    "priority": "low|normal|high|urgent",
    "amountAtRisk": "number|null",
    "slaDueAt": "datetime|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "ClaimMessage": {
    "id": "uuid",
    "claimId": "uuid",
    "authorId": "uuid|null",
    "type": "internal_note|customer_reply|foreman_request|foreman_response|evidence_update|resolution_draft|final_customer_response|system_event",
    "visibility": "internal_only|customer_visible|foreman_visible|claims_team_visible|owner_accounting_visible",
    "body": "string",
    "createdAt": "datetime"
  },
  "MaterialItem": {
    "id": "uuid",
    "sku": "string|null",
    "name": "string",
    "category": "boxes|packing|equipment|blankets|labels|uniforms|tools|other",
    "currentStock": "number",
    "minimumStock": "number",
    "reorderPoint": "number",
    "vendorId": "uuid|null",
    "unitCost": "number|null",
    "deductible": "boolean"
  },
  "PayrollStatement": {
    "id": "uuid",
    "foremanId": "uuid|null",
    "periodStart": "date",
    "periodEnd": "date",
    "gross": "number",
    "added": "number",
    "deducted": "number",
    "onHold": "number",
    "finalTotal": "number",
    "status": "draft|ready|approved|paid|flagged"
  }
}
```

---

# 30. QA / MANUAL TEST PLAN

## 30.1 Baseline commands

Run after every sprint:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If dev server has stale cache error:

```cmd
taskkill /F /IM node.exe
rmdir /s /q .next
npm run dev
```

## 30.2 Smoke test URLs

```text
/
/operations or /dispatch if not migrated yet
/routes
/jobs
/jobs/[id]
/storage
/storage/[id]
/claims
/claims/[id]
/finance or /payroll if not migrated yet
/payroll/foreman/FM-1049
/settings
/analytics or /reports
```

## 30.3 Role tests

Owner should see:
- all modules
- all reports
- all financials
- settings/users/access

Dispatcher should see:
- operations
- jobs
- foremen daily roster
- trucks daily assignment
- limited finance only if needed

Seller should see:
- leads assigned to self
- quotes
- customers relevant to sales
- no payroll of others
- no admin settings

Accounting should see:
- finance
- invoices
- expenses
- payroll
- reports
- not operational edits unless allowed

Claims operator should see:
- assigned/unassigned claims
- claim detail
- evidence
- no full payroll unless claim impact is relevant

Foreman should see:
- own jobs
- own payroll/my earnings
- own expenses
- own documents
- own claims requests/responses
- own time off
- no global admin/finance/customer database

## 30.4 Storage tests

- Create storage job from job.
- Assign unit.
- Generate labels for 30 items.
- Scan all items.
- Duplicate scan shows warning.
- Unexpected item shows warning.
- Missing item appears in unchecked list.
- Damaged item can attach photo/comment.
- Finish session generates PDF shell.
- Customer portal sees clean version only.

## 30.5 Claims tests

- Create claim.
- Assign operator.
- Transfer operator.
- Add internal note.
- Request foreman response.
- Add customer-facing message.
- Add evidence.
- Change priority/status.
- Resolve with decision.
- Payroll impact flag visible only to allowed roles.

## 30.6 Payroll tests

- Open Luis payroll seed.
- Confirm final statement amount.
- Confirm helper payments.
- Navigate previous/next period.
- Sort payroll list by amount.
- Filter by status.
- Expand audit details.

---

# 31. RISK REGISTER

| Risk | Severity | Why it matters | Mitigation |
|---|---:|---|---|
| Decorative UI growth | Critical | Creates fake progress | No new pages without workflow + data contract |
| localStorage as truth | Critical | No multiuser, no sync | Backend roadmap + query contracts |
| Duplicate workspaces | High | Confuses users, bloats code | Consolidate into Operations/Finance/etc |
| Storage without chain of custody | Critical | Lost items, claims, customer disputes | QR labels + scan sessions + PDFs |
| Claims without ownership | High | 1,000 claims becomes chaos | Assigned operator + queues + SLA |
| AI overpromising | Critical | Legal/financial/customer damage | Strict tool permissions + human approval |
| Payroll wrong seed | High | User loses trust | Use real statements and mark assumptions |
| Materials untracked | Medium/High | Losses/deductions disputes | Materials ledger + truck kits |
| Huge datasets loaded client-side | Critical | App becomes unusable | Server-side pagination/filter/indexes |
| Claude overbuilds | High | More bloat | No-coding audit + acceptance criteria + Ponytail review |
| Starting from scratch too soon | Medium | Loses useful prototype | Use current app as reference until v2 decision |
| Not starting clean when needed | Medium/High | Accumulated technical debt | Consider v2 after IA cleanup audit |

---

# 32. DESIGN QUALITY RULES

ArsemiaOS should feel modern, clean, operational and premium.

UI rules:

- No giant cards for lists that can reach hundreds of records.
- Use compact tables for inventory, claims, payroll, jobs and storage items.
- Use dashboards only when metrics lead to action.
- Every card should open a filtered list or exact record.
- Important workspaces need tabs, not new sidebar buttons.
- Use badges sparingly and consistently.
- Avoid colors without operational meaning.
- Date navigators must be reusable.
- Mobile/foreman app should prioritize speed and large touch targets.
- Admin web panel should prioritize dense information and filters.

Visual reference principles:

- Deposito-style layout is useful for dashboard structure and section overview, not for copying irrelevant metrics.
- Voxme/Bingo is useful for operational scan/checkoff logic, not for modern UI design.
- POC payroll email is useful for statement structure, not for UI style.
- Current Arsemia localhost screenshots are useful as visual base but need consolidation.

---

# 33. DECISION LOG

## Decision 1: One master `.md`, not zip

Reason:
The ZIP strategy wasted time and hid shallow content behind file size or images.

## Decision 2: Claude audits before coding

Reason:
Current problem is architecture, not lack of screens.

## Decision 3: Workspaces over sidebar bloat

Reason:
Top-level navigation should stay clean as modules grow.

## Decision 4: Storage must be chain-of-custody first

Reason:
Moving storage risk is not just occupancy. It is customer belongings, labels, scans, PDFs, signatures, claims and billing.

## Decision 5: AI/Automation later, not first

Reason:
AI agents need reliable data and workflows before they can act safely.

## Decision 6: Ponytail as review tool, not architect

Reason:
Ponytail can cut bloat but may oversimplify complex workflows if misused.

---

# 34. HOW TO EXTEND THIS FILE

When adding future ideas, add them under one of these headings:

```text
Sales
Operations
Jobs
Storage
Finance
Claims
Materials
Automation
AI Agents
Growth
Field Workforce
Scalability
Settings
Claude Workflow
```

Do not scatter new ideas at the bottom unless they do not fit anywhere.

Future pending topics:

- APK analysis of Voxme/Bingo/BoxMe
- photos of box/material vendors
- customer portal full design
- foreman mobile app full design
- AI call agent scripts
- affiliate contract rules
- field recruitment compliance
- backend provider selection
- ArsemiaOS v2 clean rebuild decision


---

# 35. FULL REPORT TEMPLATE CLAUDE MUST RETURN AFTER NO-CODING AUDIT

Claude must return the following report format before editing files.

```markdown
# ArsemiaOS Repo Audit — No Coding

## 1. Executive Summary
- Current architecture health:
- Biggest duplication:
- Biggest product risk:
- Biggest technical risk:
- Recommended first sprint:

## 2. Route Inventory
| Route | Current purpose | Keep as top-level? | Move under | Notes |
|---|---|---:|---|---|

## 3. Sidebar Audit
Current top-level items:

Proposed top-level items:

Items to move:

Items to remove/hide:

## 4. Duplicate Workflow Map
| Workflow | Current duplicated places | Target home | Action |
|---|---|---|---|

## 5. Decorative / Weak Pages
| Page | Why weak | Keep? | Fix |
|---|---|---:|---|

## 6. Data Store Audit
| Store/file | Data owned | Duplicates | Future backend entity |
|---|---|---|---|

## 7. Component Bloat Audit
| Component | Issue | Safe action |
|---|---|---|

## 8. Risk Register
| Risk | Severity | Mitigation |
|---|---:|---|

## 9. First Sprint Proposal
Scope:

Out of scope:

Files likely touched:

Acceptance criteria:

Testing plan:

Rollback plan:

## 10. Questions Before Coding
Only list questions that block implementation.
```

---

# 36. OPERATIONS CONTROL — IMPLEMENTATION DETAILS

## 36.1 State model

Operations Control should use a shared state model:

```json
{
  "selectedDate": "2026-07-12",
  "selectedJobId": "JOB-S1059",
  "filters": {
    "status": ["assigned", "unassigned", "en_route"],
    "zone": "all",
    "foremanId": "all",
    "truckId": "all",
    "jobType": "all"
  },
  "view": "dispatch_board"
}
```

The same selectedDate should drive:
- Dispatch Board
- Schedule/Routes
- Foreman Roster
- Truck Assignment
- Capacity & Load

## 36.2 Operations entities

```json
{
  "OperationDay": {
    "date": "date",
    "jobs": ["Job"],
    "foremen": ["ForemanAvailability"],
    "vehicles": ["VehicleAvailability"],
    "alerts": ["OperationAlert"]
  },
  "ForemanAvailability": {
    "foremanId": "uuid",
    "date": "date",
    "status": "available|on_job|en_route|break|off|time_off_pending|time_off_approved",
    "availableFrom": "time|null",
    "availableTo": "time|null",
    "assignedJobIds": ["uuid"],
    "assignedTruckId": "uuid|null"
  },
  "VehicleAvailability": {
    "vehicleId": "uuid",
    "date": "date",
    "status": "available|assigned|maintenance|out_of_service",
    "capacityCuFt": "number",
    "assignedCuFt": "number",
    "assignedJobIds": ["uuid"]
  },
  "OperationAlert": {
    "id": "uuid",
    "type": "unassigned_job|over_capacity|foreman_conflict|truck_maintenance|time_conflict|missing_confirmation",
    "severity": "low|medium|high|critical",
    "recordType": "job|foreman|vehicle|route",
    "recordId": "uuid",
    "message": "string",
    "createdAt": "datetime"
  }
}
```

## 36.3 Reassign Foreman panel

Do not use a plain select only. The panel must be smart.

Groups:

```text
Recommended
Available / Good Fit
Possible but Review
Not Recommended / Conflict
```

Criteria:

- date availability
- current jobs that day
- time window
- job type experience
- current truck
- truck capacity
- distance/zone placeholder
- time off status
- document status
- claims/performance risk later

Candidate card:

```text
Foreman name
Status
Truck
Jobs today
Available window
Capacity fit
Conflicts
Recommendation reason
```

Actions:

- Assign
- Stage reassignment
- Notify foreman
- View conflicts

## 36.4 Capacity guardrail

Rules:

```text
If job estimated CuFt > truck safeRecommendedCuFt: block or require owner/dispatcher override.
If total day CuFt on truck > safeRecommendedCuFt: high risk warning.
If truck maintenance/out-of-service: do not recommend.
If foreman time off approved: do not recommend.
If foreman time off pending: show caution.
```

---

# 37. FINANCE / PAYROLL — IMPLEMENTATION DETAILS

## 37.1 Finance entity relationships

```text
Job → Invoice
Job → PayrollLine
Job → Expense
Expense → Reimbursement
Claim → DeductionReview
StorageJob → StorageBillingRecord
AffiliateLead → AffiliatePayout later
```

## 37.2 PayrollLine data model

```json
{
  "PayrollLine": {
    "id": "uuid",
    "statementId": "uuid",
    "jobId": "uuid",
    "date": "date",
    "jobNumber": "string",
    "customerName": "string",
    "jobType": "string",
    "crewCommission": "number",
    "personEarned": "number",
    "adjustmentAmount": "number",
    "adjustmentType": "bonus|deduction|reimbursement|hold|none",
    "notes": "string|null",
    "auditStatus": "ok|flagged|needs_review"
  }
}
```

## 37.3 Payroll statement visual behavior

Default view:

- Keep it human-readable.
- Show money clearly.
- Reduce audit noise.

Admin expanded view:

- Commission model
- Commissionable base
- Expected vs paid
- Helper split
- Contractor reserve
- Deduction source
- Reimbursement source

## 37.4 Payroll seed mapping

Use the real statement as `Yeison Crew Statement`.

Then add helper payout examples:

```json
{
  "crewStatement": {
    "periodStart": "2026-06-22",
    "periodEnd": "2026-06-28",
    "grossPayroll": 3735.25,
    "deducted": 254.00,
    "added": 102.04,
    "finalTotal": 3583.29,
    "model": "33.5% Yeison crew"
  },
  "helperPayouts": [
    {
      "name": "Andrés POC",
      "amountPaid": 820.00,
      "method": "Zelle",
      "note": "Real payout confirmed by user; do not expose bank details."
    },
    {
      "name": "Luis Rodriguez Torres",
      "amountPaid": 720.00,
      "method": "Zelle",
      "note": "Real payout confirmed by user; do not expose bank details."
    }
  ]
}
```

## 37.5 Payroll screens

### Payroll Overview

Cards:
- Total payroll this period
- Ready for approval
- On hold
- Deductions
- Reimbursements
- Audit flags

Table:
- Foreman/helper
- Jobs
- Earned
- Added
- Deducted
- On hold
- Final
- Status

### Payroll Detail

Header:
- Person
- Period
- Status
- Final total
- Approve/Flag

Main table:
- Date
- Job #
- Customer
- Job Type
- Earned
- Notes

Bottom panels:
- Reimbursements
- Deductions
- On hold
- Audit flags
- Payout configuration

### Payroll Audit Tools

Owner/Accounting only.

Should include:
- Expected vs paid
- Commission model tests
- Contractor 33.5% simulation
- Crew 30% simulation
- Difference flags

Not top-level navigation.

---

# 38. STORAGE OS — ULTRA DETAILED WORKFLOW

## 38.1 End-to-end storage flow

```text
Quote created
↓
Quote inventory accepted
↓
Job booked
↓
Storage required? yes/no
↓
Storage job created
↓
Labels generated
↓
Foreman pickup inventory confirmed
↓
Truck load scan
↓
Storage receiving scan
↓
Unit assignment confirmed
↓
Storage billing started
↓
Storage audit if needed
↓
Customer requests delivery-out
↓
Pull from storage scan
↓
Load for delivery scan
↓
Customer delivery check-off
↓
Final PDF + signatures
↓
Storage job closed
```

## 38.2 Inventory comparison logic

There are three inventories:

```text
1. Quote inventory
2. Foreman pickup inventory
3. Storage scan inventory
```

The system must compare them.

Possible differences:

```text
Item exists in quote but not pickup → not loaded / missing before pickup completion
Item exists in pickup but not quote → extra item
Item exists in pickup but not storage receiving → missing in transit or not scanned
Item exists in storage receiving but not pickup → unexpected/wrong label
Item is scanned twice → duplicate
Item condition changed → damage/condition issue
```

## 38.3 Label numbering rules

For each job:

- Label numbers are unique inside the job.
- QR codes are globally unique.
- Label range can be generated from expected inventory.
- Labels can be reprinted.
- Reprint events must be logged.

Example:

```text
JOB-575431
1-20 Boxes
21 Desk Chair
22 Desk
23 Carpet
24 TV
25 Mattress
26 Hardware Box
27 Stool
28 Sofa
29 Picture
30 Dresser
```

## 38.4 Scan session validation matrix

| Scenario | Result | Required UI |
|---|---|---|
| Expected item scanned first time | Checked | green success |
| Expected item scanned twice | Duplicate | warning with first scan time/user |
| Item belongs to another job | Unexpected | block or require supervisor review |
| Unknown QR | Unknown | manual review |
| Expected item not scanned | Unchecked/Missing | list before finish |
| Item marked damaged | Damaged | photo/comment prompt |
| Condition changes from intact to scratched | Condition changed | evidence required |

## 38.5 Document generation rules

Document is generated after scan session completion.

Document must include:
- header/branding
- customer
- job/ref
- scan session type
- address/location
- expected/scanned/unchecked/damaged/duplicate/unexpected counts
- item table
- signature blocks
- disclaimer
- generated by user/time
- linked records

Document record:

```json
{
  "Document": {
    "id": "uuid",
    "type": "storage_receiving_pdf",
    "jobId": "uuid",
    "storageJobId": "uuid",
    "scanSessionId": "uuid",
    "customerId": "uuid",
    "fileUrl": "string|null",
    "status": "generating|ready|failed",
    "createdBy": "uuid",
    "createdAt": "datetime"
  }
}
```

## 38.6 Storage billing logic

Storage billing record:

```json
{
  "StorageBillingRecord": {
    "id": "uuid",
    "storageJobId": "uuid",
    "customerId": "uuid",
    "periodStart": "date",
    "periodEnd": "date",
    "amount": "number",
    "status": "draft|sent|paid|overdue|cancelled",
    "invoiceId": "uuid|null",
    "dueDate": "date",
    "paidAt": "datetime|null"
  }
}
```

Rules:
- Storage billing may be separate from move invoice.
- Customer reminders should be automatic later.
- Overdue storage must appear in Dashboard and Storage Command Center.

---

# 39. CLAIMS — ULTRA DETAILED WORKFLOW

## 39.1 Claim lifecycle

```text
Claim created
↓
Triaged
↓
Assigned operator
↓
Evidence requested
↓
Foreman response requested
↓
Internal review
↓
Decision draft
↓
Approval if financial/legal risk
↓
Customer final response
↓
Payroll/finance impact if needed
↓
Closed
```

## 39.2 Claim source types

```text
customer_email
customer_call
foreman_report
storage_exception
delivery_checkoff
missing_item_scan
damaged_item_scan
internal_admin
```

## 39.3 Claim SLA rules

Priority to SLA examples:

```text
Urgent: first response within 4 business hours
High: first response within 1 business day
Normal: first response within 2 business days
Low: first response within 3 business days
```

SLA statuses:

```text
on_track
at_risk
overdue
paused_waiting_customer
paused_waiting_foreman
```

## 39.4 Claim participants

Each claim can include:

```text
Customer
Assigned operator
Owner/manager
Foreman involved
Helper(s) involved optional
Dispatcher optional
Accounting optional
Storage operator optional
Insurance contact optional
```

Each participant has visibility scope.

## 39.5 Claim permission rules

Customer-facing messages:
- visible to customer
- generated from approved response
- never include internal blame/payroll notes

Internal notes:
- claims team/owner only
- may include investigation details

Foreman requests:
- visible to selected foreman
- ask for response/evidence

Payroll impact:
- visible to owner/accounting/payroll roles
- not visible to customer

## 39.6 Claim resolution types

```text
denied_pre_existing
approved_customer_credit
approved_cash_reimbursement
repair_scheduled
insurance_review
foreman_deduction_review
storage_exception_resolved
missing_item_found
no_action_closed
```

Each resolution requires:
- reason
- evidence references
- approver if required
- customer message
- financial impact if any

---

# 40. AUTOMATION + AI — DEEP SPEC

## 40.1 Automation Center screens

```text
Automation Dashboard
Rules
Approvals
Activity
Failures
Integrations
Canvas Prototype later
```

Automation Dashboard shows:
- active rules
- paused rules
- runs today
- failed runs
- approvals pending
- most triggered automations

Rule detail shows:
- trigger
- conditions
- actions
- approval gate
- roles affected
- activity log
- run history

## 40.2 Default automation rules

### AUTO-LEAD-001 — Assign new lead

Trigger:
```text
lead.created
```

Conditions:
```text
lead.status = new
seller.available = true
seller.activeLeadCount < maxLeadCapacity
seller.market matches lead.market if available
```

Actions:
```text
assign to best seller
notify seller
start SLA timer
log activity
```

Approval:
```text
not required
```

### AUTO-LEAD-002 — Escalate untouched high-value lead

Trigger:
```text
lead.sla_timer_expired
```

Conditions:
```text
lead.status still new/contacted not updated
lead.score high OR move date urgent
```

Actions:
```text
notify owner/sales manager
recommend reassignment
optionally reassign if rule configured
```

Approval:
```text
optional depending company setting
```

### AUTO-STORAGE-001 — Damaged storage item creates exception

Trigger:
```text
storage_item.marked_damaged
```

Actions:
```text
create storage exception
notify claims/storage
attach photos/comments
link to job/customer/item/session
```

Approval:
```text
not required to create exception
required to approve customer payout
```

### AUTO-CLAIM-001 — Claim awaiting foreman response

Trigger:
```text
claim.created OR claim.status = awaiting_foreman
```

Actions:
```text
notify foreman
start response SLA
show in claims queue
```

### AUTO-FINANCE-001 — Invoice overdue

Trigger:
```text
invoice.due_date_passed
```

Actions:
```text
notify accounting
show on dashboard
prepare customer reminder draft
```

### AUTO-PAYROLL-001 — Claim opens payroll hold review

Trigger:
```text
claim.created with payrollImpact = true
```

Actions:
```text
flag payroll line
notify owner/accounting
mark hold review pending
```

Approval:
```text
required before deduction
```

### AUTO-TIMEOFF-001 — Time off risk calculation

Trigger:
```text
foreman.time_off_requested
```

Actions:
```text
calculate operational risk
check jobs assigned
suggest replacements
notify dispatcher/owner
```

Approval:
```text
required if medium/high risk
```

## 40.3 AI agent permissions

AI Intake Agent can:
- ask customer questions
- collect contact/move details
- request item list/photos/video
- create lead draft
- create inventory draft
- summarize details

AI Intake Agent cannot:
- quote final price
- guarantee availability
- promise refund
- approve discount
- make legal statement

AI Sales Assistant can:
- draft seller responses
- score lead
- recommend follow-up
- summarize call/transcript
- suggest upsells

AI Sales Assistant cannot:
- send final contract without approval
- change price rules
- bypass quote approval rules

AI Claims Assistant can:
- summarize evidence
- draft internal note
- draft customer response
- identify missing info

AI Claims Assistant cannot:
- approve/deny claim alone
- issue refund
- assign blame as final decision

## 40.4 AI video inventory intake data contract

```json
{
  "VideoInventoryIntake": {
    "id": "uuid",
    "leadId": "uuid|null",
    "quoteId": "uuid|null",
    "customerId": "uuid|null",
    "mediaUrl": "string",
    "status": "uploaded|transcribing|extracting_items|needs_customer_review|confirmed|rejected|failed",
    "transcript": "string|null",
    "detectedItems": [
      {
        "name": "Queen Bed",
        "quantity": 1,
        "room": "Bedroom",
        "confidence": 0.88,
        "matchedCatalogItemId": "uuid|null",
        "needsReview": false
      }
    ],
    "customerConfirmedAt": "datetime|null",
    "sellerReviewedAt": "datetime|null"
  }
}
```

---

# 41. CLEAN REBUILD OPTION — WHEN TO START ARSEMIAOS V2

A clean rebuild may become correct if:

- code bloat keeps increasing
- localStorage store structure blocks backend migration
- duplicate routes cannot be safely consolidated
- components are too large and entangled
- build remains clean but product behavior is fake
- every sprint introduces regressions

Do not start clean just because the current app is imperfect.

Use current app as:
- visual reference
- product discovery prototype
- component inspiration
- workflow testbed

Start v2 only after:

1. Information Architecture is final.
2. Entity model is stable.
3. Backend choice is decided.
4. Core workflows are known.
5. A migration plan exists.

Potential v2 stack:

```text
Next.js
Postgres
Prisma/Drizzle
Auth provider
Server-side query layer
Proper file storage
Queue/background jobs
Testing from day one
```

---

# 42. FINAL HUMAN REVIEW CHECKLIST BEFORE SENDING TO CLAUDE

Before sending any prompt to Claude, answer:

1. Is this a no-coding audit or coding sprint?
2. What exact module is in scope?
3. What is explicitly out of scope?
4. What files/routes are likely affected?
5. What acceptance criteria prove success?
6. What commands must pass?
7. What localhost screens must be reviewed?
8. What should Claude report back?
9. What should be protected from deletion?
10. What known user complaint does this sprint solve?

If these are not answered, the prompt is not ready.

---

# 43. SHORT FORM FIRST MESSAGE TO CLAUDE

Use this if Claude context is limited.

```text
Do not code yet. Audit ArsemiaOS against the attached Master Pack.

Focus only on:
1. route/sidebar bloat
2. duplicate workflows
3. Dispatch/Routes/Foremen/Fleet overlap
4. Invoices/Expenses/Payroll consolidation into Finance
5. decorative/weak pages
6. data/store duplication
7. first safe implementation sprint

Return report only. Wait for approval before editing files.
```

---

# 44. LONG FORM FIRST MESSAGE TO CLAUDE

Use this when starting a serious session.

```text
You are the implementation architect for ArsemiaOS.

Read the Master Pack as product direction, not as a command to build everything.

Current goal:
Stop adding pages. Clean the information architecture first.

The product owner observed:
- Dispatch and Routes overlap.
- Foremen and Fleet overlap with daily operations.
- Finance is split across too many sidebar items.
- Payroll looks nice but needs real statement behavior.
- Claims looks clean but does not scale to many operators/claims.
- Analytics is attractive but may be decorative.
- Settings has weak/decorative areas.
- Storage needs a serious chain-of-custody rebuild later.

Your task now:
Audit, propose, do not code.

Return:
- route inventory
- sidebar consolidation plan
- workspace target map
- duplicate workflow map
- dead/decorative UI list
- first coding sprint proposal
- acceptance criteria
- risks
- files affected

Do not build Storage, Automation, AI Agents, backend, Growth, or new dashboards yet.
```

---

# 45. CLOSING PRINCIPLE

ArsemiaOS must not become a graveyard of beautiful screens.

It must become a working operating system where:

- no lead is lost
- no quote starts empty
- no job lacks an owner
- no foreman is wrongly assigned
- no truck is overloaded silently
- no storage item disappears without trace
- no claim lacks ownership
- no payroll is improvised
- no invoice is forgotten
- no material loss is invisible
- no automation acts without guardrails

Build slower if needed. Build connected. Build auditable. Build for the field.


---

# 46. IMPLEMENTATION BACKLOG — TICKET LEVEL

These are not all meant for one sprint. They exist so Claude cannot pretend vague goals are enough. Each ticket must have exact scope, out-of-scope, and acceptance criteria before coding.

## IA-001 — Rewrite sidebar into workspace-first structure.

**Category:** Information Architecture

**Goal:** Rewrite sidebar into workspace-first structure.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-002 — Move Routes under Operations workspace.

**Category:** Information Architecture

**Goal:** Move Routes under Operations workspace.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-003 — Move Invoices/Expenses/Payroll under Finance workspace.

**Category:** Information Architecture

**Goal:** Move Invoices/Expenses/Payroll under Finance workspace.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-004 — Move Privacy & Data under Security & Compliance.

**Category:** Information Architecture

**Goal:** Move Privacy & Data under Security & Compliance.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-005 — Hide Payroll Tools from primary navigation.

**Category:** Information Architecture

**Goal:** Hide Payroll Tools from primary navigation.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-006 — Create route redirect map for old routes.

**Category:** Information Architecture

**Goal:** Create route redirect map for old routes.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-007 — Add workspace tab shell without duplicating stores.

**Category:** Information Architecture

**Goal:** Add workspace tab shell without duplicating stores.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-008 — Document removed/hidden routes and replacements.

**Category:** Information Architecture

**Goal:** Document removed/hidden routes and replacements.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-009 — Add smoke tests for navigation routes.

**Category:** Information Architecture

**Goal:** Add smoke tests for navigation routes.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## IA-010 — Add final report for route consolidation.

**Category:** Information Architecture

**Goal:** Add final report for route consolidation.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-001 — Create shared Operations selected date state.

**Category:** Operations Control

**Goal:** Create shared Operations selected date state.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-002 — Build reusable full-width DateNavigator.

**Category:** Operations Control

**Goal:** Build reusable full-width DateNavigator.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-003 — Merge Dispatch Board into Operations tab.

**Category:** Operations Control

**Goal:** Merge Dispatch Board into Operations tab.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-004 — Merge Routes/Schedule into Operations tab.

**Category:** Operations Control

**Goal:** Merge Routes/Schedule into Operations tab.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-005 — Add Foreman Roster operational tab.

**Category:** Operations Control

**Goal:** Add Foreman Roster operational tab.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-006 — Add Truck Assignment operational tab.

**Category:** Operations Control

**Goal:** Add Truck Assignment operational tab.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-007 — Add Capacity & Load tab.

**Category:** Operations Control

**Goal:** Add Capacity & Load tab.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-008 — Fix Foremen on duty panel clipping.

**Category:** Operations Control

**Goal:** Fix Foremen on duty panel clipping.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-009 — Add smart reassign grouped recommendations.

**Category:** Operations Control

**Goal:** Add smart reassign grouped recommendations.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-010 — Add truck capacity guardrails.

**Category:** Operations Control

**Goal:** Add truck capacity guardrails.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-011 — Add time-off conflict placeholder.

**Category:** Operations Control

**Goal:** Add time-off conflict placeholder.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## OPS-012 — Add operations alerts panel.

**Category:** Operations Control

**Goal:** Add operations alerts panel.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-001 — Create Finance workspace shell.

**Category:** Finance Payroll

**Goal:** Create Finance workspace shell.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-002 — Move payroll overview under Finance.

**Category:** Finance Payroll

**Goal:** Move payroll overview under Finance.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-003 — Move invoices under Finance.

**Category:** Finance Payroll

**Goal:** Move invoices under Finance.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-004 — Move expenses under Finance.

**Category:** Finance Payroll

**Goal:** Move expenses under Finance.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-005 — Create simplified payroll statement table.

**Category:** Finance Payroll

**Goal:** Create simplified payroll statement table.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-006 — Add previous/next payroll period controls.

**Category:** Finance Payroll

**Goal:** Add previous/next payroll period controls.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-007 — Add payroll sorting/filtering.

**Category:** Finance Payroll

**Goal:** Add payroll sorting/filtering.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-008 — Add real Yeison crew payroll seed.

**Category:** Finance Payroll

**Goal:** Add real Yeison crew payroll seed.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-009 — Add helper payouts for Andrés and Luis.

**Category:** Finance Payroll

**Goal:** Add helper payouts for Andrés and Luis.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-010 — Move payroll tools into Audit Tools.

**Category:** Finance Payroll

**Goal:** Move payroll tools into Audit Tools.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-011 — Add reimbursement/deduction review panels.

**Category:** Finance Payroll

**Goal:** Add reimbursement/deduction review panels.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## FIN-012 — Protect payroll views by role.

**Category:** Finance Payroll

**Goal:** Protect payroll views by role.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-001 — Design Storage route structure.

**Category:** Storage OS

**Goal:** Design Storage route structure.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-002 — Build Storage Command Center KPIs.

**Category:** Storage OS

**Goal:** Build Storage Command Center KPIs.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-003 — Build Storage Calendar.

**Category:** Storage OS

**Goal:** Build Storage Calendar.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-004 — Build Units & Map section overview.

**Category:** Storage OS

**Goal:** Build Units & Map section overview.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-005 — Build Unit Detail tab shell.

**Category:** Storage OS

**Goal:** Build Unit Detail tab shell.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-006 — Build item-first Storage Inventory table.

**Category:** Storage OS

**Goal:** Build item-first Storage Inventory table.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-007 — Build Label Printing screen.

**Category:** Storage OS

**Goal:** Build Label Printing screen.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-008 — Build QR payload model.

**Category:** Storage OS

**Goal:** Build QR payload model.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-009 — Build Scan Sessions screen.

**Category:** Storage OS

**Goal:** Build Scan Sessions screen.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-010 — Add duplicate/unexpected/missing scan logic.

**Category:** Storage OS

**Goal:** Add duplicate/unexpected/missing scan logic.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-011 — Add damaged item evidence capture shell.

**Category:** Storage OS

**Goal:** Add damaged item evidence capture shell.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-012 — Generate Storage Receiving PDF shell.

**Category:** Storage OS

**Goal:** Generate Storage Receiving PDF shell.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-013 — Add signature blocks.

**Category:** Storage OS

**Goal:** Add signature blocks.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-014 — Add Customer Portal preview.

**Category:** Storage OS

**Goal:** Add Customer Portal preview.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-015 — Add Blanket Ledger.

**Category:** Storage OS

**Goal:** Add Blanket Ledger.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## STO-016 — Add Storage Billing records.

**Category:** Storage OS

**Goal:** Add Storage Billing records.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-001 — Create Materials Dashboard.

**Category:** Materials Supplies

**Goal:** Create Materials Dashboard.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-002 — Create Material Catalog.

**Category:** Materials Supplies

**Goal:** Create Material Catalog.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-003 — Create Vendor Directory.

**Category:** Materials Supplies

**Goal:** Create Vendor Directory.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-004 — Create Foreman Material Request flow.

**Category:** Materials Supplies

**Goal:** Create Foreman Material Request flow.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-005 — Create Truck Kits.

**Category:** Materials Supplies

**Goal:** Create Truck Kits.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-006 — Create Material Ledger.

**Category:** Materials Supplies

**Goal:** Create Material Ledger.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-007 — Create Uniform tracking.

**Category:** Materials Supplies

**Goal:** Create Uniform tracking.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-008 — Connect deductible materials to payroll review.

**Category:** Materials Supplies

**Goal:** Connect deductible materials to payroll review.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-009 — Connect blankets to Storage Ledger.

**Category:** Materials Supplies

**Goal:** Connect blankets to Storage Ledger.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## MAT-010 — Add low-stock alerts.

**Category:** Materials Supplies

**Goal:** Add low-stock alerts.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-001 — Add claim operator assignment.

**Category:** Claims Scale

**Goal:** Add claim operator assignment.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-002 — Add claim transfer flow.

**Category:** Claims Scale

**Goal:** Add claim transfer flow.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-003 — Add claim queues.

**Category:** Claims Scale

**Goal:** Add claim queues.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-004 — Add SLA status.

**Category:** Claims Scale

**Goal:** Add SLA status.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-005 — Add participants/watchers.

**Category:** Claims Scale

**Goal:** Add participants/watchers.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-006 — Separate internal/customer/foreman message modes.

**Category:** Claims Scale

**Goal:** Separate internal/customer/foreman message modes.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-007 — Add evidence timeline.

**Category:** Claims Scale

**Goal:** Add evidence timeline.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-008 — Add decision log.

**Category:** Claims Scale

**Goal:** Add decision log.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-009 — Add final response workflow.

**Category:** Claims Scale

**Goal:** Add final response workflow.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-010 — Add payroll impact review.

**Category:** Claims Scale

**Goal:** Add payroll impact review.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-011 — Add storage-related claim links.

**Category:** Claims Scale

**Goal:** Add storage-related claim links.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## CLM-012 — Add claim query filters.

**Category:** Claims Scale

**Goal:** Add claim query filters.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-001 — Define query service interfaces.

**Category:** Scalability

**Goal:** Define query service interfaces.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-002 — Add query contracts for major modules.

**Category:** Scalability

**Goal:** Add query contracts for major modules.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-003 — Add pageSize/filter/sort states.

**Category:** Scalability

**Goal:** Add pageSize/filter/sort states.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-004 — Add server-ready repository layer placeholder.

**Category:** Scalability

**Goal:** Add server-ready repository layer placeholder.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-005 — Identify client-side large-array filtering.

**Category:** Scalability

**Goal:** Identify client-side large-array filtering.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-006 — Add cache invalidation notes.

**Category:** Scalability

**Goal:** Add cache invalidation notes.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-007 — Define background jobs.

**Category:** Scalability

**Goal:** Define background jobs.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-008 — Add load testing plan.

**Category:** Scalability

**Goal:** Add load testing plan.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-009 — Add role-based saved views.

**Category:** Scalability

**Goal:** Add role-based saved views.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## SCL-010 — Add index recommendations.

**Category:** Scalability

**Goal:** Add index recommendations.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-001 — Define Automation Center data model.

**Category:** Automation AI Growth

**Goal:** Define Automation Center data model.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-002 — Create automation rule schema.

**Category:** Automation AI Growth

**Goal:** Create automation rule schema.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-003 — Create approval gate schema.

**Category:** Automation AI Growth

**Goal:** Create approval gate schema.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-004 — Define AI agent tool permissions.

**Category:** Automation AI Growth

**Goal:** Define AI agent tool permissions.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-005 — Define video/audio inventory flow.

**Category:** Automation AI Growth

**Goal:** Define video/audio inventory flow.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-006 — Define affiliate referral tracking model.

**Category:** Automation AI Growth

**Goal:** Define affiliate referral tracking model.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-007 — Define field growth/academy model.

**Category:** Automation AI Growth

**Goal:** Define field growth/academy model.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-008 — Define integration statuses.

**Category:** Automation AI Growth

**Goal:** Define integration statuses.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-009 — Define webhook/event catalog.

**Category:** Automation AI Growth

**Goal:** Define webhook/event catalog.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.

## AUTO-010 — Define human handoff rules.

**Category:** Automation AI Growth

**Goal:** Define human handoff rules.

**Scope:**
- Implement only the minimum required product behavior for this ticket.
- Reuse existing components/stores when safe.
- Do not create duplicate routes or decorative panels.

**Out of scope:**
- No backend migration unless ticket explicitly says backend.
- No AI/automation unless ticket is in Automation category.
- No new visual-only widgets.

**Acceptance criteria:**
- User can verify the behavior in localhost.
- TypeScript passes.
- Build passes.
- Changes are listed in final report.
- Any mock/local-only behavior is labeled honestly.


---

# 47. PERMISSION MATRIX

| Feature | Owner | Dispatcher | Seller | Accounting | Claims Operator | Marketing | Foreman | Admin |
|---|---|---|---|---|---|---|---|---|
| Dashboard | Full | View/Edit | No | Limited | No | No | No | Full |
| Sales Leads | Full | Limited | View/Edit own | Limited | No | No | No | Full |
| Quotes | Full | Limited | View/Edit own | Limited | No | No | No | Full |
| Customers | Full | Limited | View/Edit own | Limited | No | No | No | Full |
| Operations Control | Full | View/Edit | No | Limited | No | No | No | Full |
| Jobs | Full | View/Edit | View linked | Limited | View linked | No | Own only | Full |
| Foreman Roster | Full | View/Edit | No | Limited | No | No | No | Full |
| Fleet Assets | Full | View/Edit | No | Limited | No | No | No | Full |
| Storage | Full | View/Edit | No | Limited | View linked | No | Own only | Full |
| Storage Billing | Full | Limited | No | View/Edit | No | No | No | Full |
| Claims Inbox | Full | Limited | No | Limited | View/Edit | No | Own only | Full |
| Claims Resolution | Full | Limited | No | Limited | View/Edit | No | No | Full |
| Invoices | Full | Limited | No | View/Edit | No | No | No | Full |
| Expenses | Full | Limited | No | View/Edit | No | No | Own only | Full |
| Payroll | Full | Limited | No | View/Edit | No | No | Own only | Full |
| Materials | Full | Limited | No | Limited | No | No | No | Full |
| Reports | Full | Limited | No | View/Edit | No | View/Edit | No | Full |
| Settings | Full | Limited | No | Limited | No | No | No | Full |
| Users & Access | Full | Limited | No | Limited | No | No | No | Full |
| Integrations | Full | Limited | No | Limited | No | No | No | Full |
| Automation Center | Full | Limited | No | Limited | No | No | No | Full |
| Affiliate Growth | Full | Limited | No | Limited | No | View/Edit | No | Full |

---

# 48. EVENT CATALOG

Every important action should create an ActivityLog entry and optionally trigger notifications or automation rules.

## Sales Events

### `lead.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `lead.assigned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `lead.sla_expired`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `quote.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `quote.sent`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `quote.accepted`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `customer.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## Operations Events

### `job.scheduled`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `job.assigned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `foreman.reassigned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `truck.assigned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `truck.over_capacity`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `route.updated`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `job.status_changed`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## Storage Events

### `storage_job.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.labels_printed`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.scan_started`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.item_scanned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.item_missing`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.item_damaged`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.scan_completed`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.pdf_generated`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `storage.billing_due`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## Finance Events

### `invoice.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `invoice.sent`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `invoice.overdue`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `expense.submitted`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `expense.approved`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `payroll.ready`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `payroll.approved`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `deduction.review_required`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `reimbursement.added`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## Claims Events

### `claim.created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.assigned`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.transferred`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.awaiting_foreman`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.evidence_added`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.resolution_drafted`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `claim.closed`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## Materials Events

### `material.requested`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `material.issued`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `material.low_stock`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `truck_kit.audit_failed`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `blanket.mismatch`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

## AutomationAI Events

### `automation.rule_triggered`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `automation.approval_required`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `ai.intake_created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `ai.inventory_draft_created`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk

### `ai.handoff_required`

Payload should include:
- eventId
- eventType
- actorId
- actorRole
- recordType
- recordId
- customerId if applicable
- jobId if applicable
- timestamp
- previousValue if applicable
- nextValue if applicable
- visibility scope

Possible downstream actions:
- create notification
- update dashboard cache
- write audit log
- start automation rule
- request approval if high risk


---

# 49. SAVED VIEWS

Large modules need saved views. Saved views prevent users from drowning in data.

## Claims saved views

```json
[
  { "name": "Assigned to me", "filters": { "assignedTo": "currentUser", "status": ["open", "pending", "under_review"] } },
  { "name": "Unassigned", "filters": { "assignedTo": null, "status": ["open", "pending"] } },
  { "name": "Awaiting foreman", "filters": { "status": "awaiting_foreman" } },
  { "name": "SLA overdue", "filters": { "slaStatus": "overdue" } },
  { "name": "Payroll impact", "filters": { "payrollImpact": true } },
  { "name": "Storage related", "filters": { "storageRelated": true } }
]
```

## Storage saved views

```json
[
  { "name": "Entering today", "filters": { "storageInDate": "today" } },
  { "name": "Leaving today", "filters": { "expectedOutDate": "today" } },
  { "name": "Overdue", "filters": { "status": "overdue" } },
  { "name": "Missing items", "filters": { "itemStatus": "missing" } },
  { "name": "Damaged items", "filters": { "itemStatus": "damaged" } },
  { "name": "Blanket mismatch", "filters": { "blanketMismatch": true } }
]
```

## Leads saved views

```json
[
  { "name": "Unassigned leads", "filters": { "assignedSellerId": null, "status": "new" } },
  { "name": "My open leads", "filters": { "assignedSellerId": "currentUser", "status": ["new", "contacted", "follow_up"] } },
  { "name": "SLA at risk", "filters": { "slaStatus": "at_risk" } },
  { "name": "High value", "filters": { "leadScore": "high" } },
  { "name": "End of month moves", "filters": { "moveDateCycle": "end_of_month" } }
]
```

---

# 50. BACKEND MIGRATION PREP CHECKLIST

Before real backend work starts:

- Freeze module map.
- Freeze entity model v1.
- Choose auth provider.
- Choose Postgres hosting.
- Choose file storage.
- Define permissions server-side.
- Define audit log model.
- Define query layer.
- Define seed data migration from mock stores.
- Define background job provider.
- Define environment variable strategy.
- Define error tracking.
- Define backup strategy.
- Define data retention policy.

Backend MVP order:

1. Users/Auth/Roles
2. Customers/Leads/Quotes/Jobs
3. Operations assignment
4. Finance/Payroll basics
5. Storage/Scan/Docs
6. Claims
7. Integrations/Automation

---

# 51. FINAL WARNING FOR CLAUDE

Do not confuse length with quality. Do not confuse UI with product. Do not confuse local mock state with production architecture.

The product owner is not asking for more decorative pages. The product owner is asking for a scalable operational system.

If a proposed change does not reduce duplication, connect workflows, prepare backend readiness, or make a real operation easier, do not implement it.
