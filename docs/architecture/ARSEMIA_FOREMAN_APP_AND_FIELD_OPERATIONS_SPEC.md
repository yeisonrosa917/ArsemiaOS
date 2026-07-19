# ARSEMIAOS — Foreman App & Field Operations Requirements

**Version:** 0.3  
**Purpose:** Capture the Foreman App, field operations, scanning, signatures, assignment handoff, warehouse/storage, availability, time-off, LD travel blocks, evidence, offline behavior, and mobile execution rules for ArsemiaOS.

> Legal/product boundary: this document does **not** copy proprietary source code, UI assets, or implementation from PoC. It extracts workflow lessons from a reference APK/screenshots and converts them into an original ArsemiaOS product specification.

---

## 1. Core Principle

ArsemiaOS is not only an Owner web dashboard. It needs three operational nervous systems:

1. **Owner/Admin Web** — command center, assignments, audit, finance, claims, fleet, storage, reports.
2. **Foreman Mobile App** — field execution: confirm, start, scan, document, charge, report, complete.
3. **Warehouse/Storage Operator App** — receiving, staging, pallets, warehouse scans, incidents.

The foreman app and warehouse app create operational events. The Owner/Admin Web interprets those events.

```text
Foreman App / Warehouse App
  -> Event stream
  -> Jobs
  -> Operations
  -> Storage / Warehouse
  -> Claims
  -> Payroll
  -> Finance / Invoices
  -> Fleet
  -> Activity Log
```

---

## 2. Reference Feature Inventory From PoC APK

The uploaded PoC Mover APK appears to include or reference these functional areas:

- Dashboard
- Active job
- Job detail
- Calendar
- Notifications
- Settings
- Vacation / Day Off Request
- Scanning
- Delivery scanning
- Storage scanning
- Storage scanning signature
- Inventory items
- Scan barcode
- Scan inventory
- Scanned items
- Not scanned items
- Cannot scan item / piece
- Reason why item cannot be scanned
- Pallet
- Add pallet
- Remove pallet
- Scan pallet
- Storage In
- Storage Out
- Warehouse In
- Warehouse Out
- Internal Warehouse In
- Internal Warehouse Out
- Storage contract
- Storage receipt
- Warehouse & Foreman statement
- Materials
- Other charges
- Additional documents
- Assistance / support
- Feedback / claim
- Box / Bin details
- Start job
- Pickup completed
- Delivery completed
- Start job local / hourly / long distance / storage move-in

### Important Lesson

The PoC app is not just showing jobs. It is trying to capture the field workflow: documents, status, scanning, pallets, storage, charges, materials, time off, support, and claim evidence.

ArsemiaOS should not copy it. ArsemiaOS should **surpass it** by making those actions cleaner, more connected, more auditable, and more useful to Owner/Dispatch/Claims/Payroll.

---

## 3. Foreman App Mission

The Foreman App should answer:

```text
What jobs do I have?
What do I need to confirm?
Where do I go?
What do I need to read before starting?
What must I scan?
What documents must be signed?
What charges/materials must I record?
What issues must I report?
What proof protects me from false blame?
What do I need to complete before payroll closes?
```

The Foreman App is not a mini-owner dashboard. It is a task-focused execution app.

---

## 4. Main Foreman App Navigation

Recommended tabs:

```text
Today
Calendar
Scans
Documents
Notifications
Profile
```

Or, simpler MVP:

```text
My Jobs
Calendar
Notifications
Profile
```

Inside job detail, all operational actions live.

---

## 5. Foreman App Screens

### 5.1 My Jobs / Dashboard

Shows:

- Today jobs
- Tomorrow jobs
- Future assigned jobs
- Pending confirmations
- Job count by date
- Status chips:
  - Draft assignment
  - Notified
  - Confirmed
  - Declined
  - Started
  - Completed
  - Issue reported

Actions:

- Confirm assignment
- Decline assignment with reason
- Open job
- Call dispatch / assistance

### 5.2 Calendar

The calendar should show job counts under dates, similar in concept to PoC but cleaner and more modern.

Requirements:

- Month view
- Job count under each date
- Highlight today
- Highlight selected date
- Show confirmed/unconfirmed indicators
- Tap date -> jobs for that date
- Future-focused, not stuck in past demo data

### 5.3 Job Detail

Must show:

- Job number
- Customer name
- Job type
- Crew ID / Foreman ID
- Assignment status
- Start time / finish time
- Job time
- CuFt / volume
- Total / balance if foreman is allowed to see it
- Customer phone
- Pickup address
- Delivery address
- Additional stops
- Special instructions
- Lead comments
- Documents
- Inventory
- Other charges
- Additional services
- Materials
- Assistance
- Status actions

### 5.4 Start Job / Status Updates

Status flow:

```text
Assigned
Notified
Confirmed
En route to pickup
At pickup
Pickup started
Pickup completed
En route to delivery
At delivery
Delivery started
Delivery completed
Completed
Issue reported
```

MVP may use fewer statuses:

```text
Assigned -> Confirmed -> Started -> Pickup Completed -> Delivery Completed -> Completed
```

Every status change creates an event.

### 5.5 Documents

Documents should be linked to job.

Possible document types:

- Binding quote / estimate
- Agreement
- Customer packing
- COI provided
- Move confirmed
- Start job document
- Pickup completed document
- Delivery completed document
- Storage contract
- Storage receipt
- Warehouse statement
- Foreman statement
- Feedback / claim document
- Box / bin details
- Additional documents

Owner/Admin should see document status from Job Detail.

### 5.6 Inventory / Scan

Core scan capabilities:

- Scan barcode / QR
- Manual entry if barcode damaged
- Can't scan reason
- Scanned items list
- Not scanned items list
- Damaged item report
- Missing item report
- Add photo to item
- Add condition note
- Final scan summary

Only these roles create item scans:

1. Foreman
2. Warehouse / Storage Operator

Owner/Dispatcher/Claims/Finance can view or audit scans, but do not normally create scans.

### 5.7 Storage / Warehouse Scanning

Modes:

- Storage In
- Storage Out
- Warehouse In
- Warehouse Out
- Internal Warehouse In
- Internal Warehouse Out
- Delivery scan
- Final checkoff

Each mode must create a `scanSession`.

### 5.8 Pallets

Future LD/warehouse functionality:

- Add pallet
- Remove pallet
- Scan pallet
- Assign items to pallet
- Pallet label
- Pallet condition
- Pallet photos
- Pallet loaded on trailer
- Pallet received at destination warehouse

Pallet label should include:

- Job number
- Customer name
- Origin warehouse
- Destination warehouse
- Pallet number
- CuFt estimate
- Item count
- Blanket count
- TV box count
- Wardrobe count
- QR/barcode

### 5.9 Materials / Other Charges / Additional Services

Foreman can record:

- Materials used
- Blankets used
- TV boxes
- Wardrobe boxes
- Shrink wrap
- Packing paper
- Plastic bins
- Extra labor
- Extra pickup/delivery
- Long carry
- Stairs/elevator changes
- Tolls
- Parking
- Special request
- Other charges

These should feed:

- Job revenue
- Invoice line items
- Payroll commissionable/audit base
- Materials ledger
- Claim evidence if damage relates to packing

### 5.10 Assistance / Support

Assistance categories:

- Dispatch
- Sales
- Fleet
- Claim / Damage
- Customer issue
- Storage / Warehouse
- Materials
- Payroll issue
- Emergency

An assistance request should create:

- Job event
- Notification
- Ticket/exception
- Possibly claim draft if claim/damage

### 5.11 Time Off / Day Off Request

Time off flow:

```text
Foreman submits request
  -> reason
  -> date range
  -> optional note
  -> branch/dispatcher decision queue
  -> pending/approved/rejected
  -> if approved, block assignment dates
  -> if pending, warn dispatcher during assignment
```

Reasons:

- Vacation
- Sick leave
- Appointment
- Personal reason
- Emergency
- Other

Email may still be used as communication channel, but ArsemiaOS must be source of truth.

### 5.12 Truck Inspection

Future field app function:

- Odometer
- Fuel level
- Tires
- Brakes
- Lights
- Liftgate/ramp
- Body damage
- Equipment/blankets/tools
- Photos
- Notes
- Signature

Feeds:

- Fleet maintenance
- Operations alerts
- Payroll reimbursements if needed
- Materials/blanket ledger

---

## 6. Owner/Admin Web Reflection

Every foreman action must appear somewhere in Owner/Admin Web.

| Foreman/Warehouse action | Owner Web destination |
|---|---|
| Confirm assignment | Operations / Assignments |
| Decline assignment | Operations alert + decision queue |
| Start job | Dispatch Board + Job timeline |
| Pickup completed | Job timeline + Operations status |
| Delivery completed | Job closeout + Payroll readiness |
| Scan item | Storage/Inventory + Job custody timeline |
| Cannot scan item | Exception queue + Claims evidence |
| Add damage photo | Claims/evidence + Item timeline |
| Add material | Job charges + Finance + Payroll audit |
| Add other charge | Job charges + Invoice line item |
| Request assistance | Ticket/alert + Job timeline |
| Submit time off | Availability + Assignment warning |
| Truck inspection | Fleet + Operations alert |
| Warehouse receive | Storage/Warehouse custody timeline |
| Palletize | Pallet record + Trailer manifest |
| Trailer load | Manifest + custody checkpoint |
| Destination receive | Warehouse scan + claim responsibility |

---

## 7. Future Unassigned Jobs Planning

The assignment workflow must cover more than tomorrow.

A dispatcher should be able to filter:

```text
Unassigned jobs
  today
  tomorrow
  next 7 days
  next 14 days
  custom date range
```

The dispatcher may work a range:

```text
Today 13 -> 20
Assign all jobs in range
See what remains unresolved
```

### Problem Scenario

Dispatcher reaches July 20, then notices July 16 still has unassigned jobs because:

- no truck
- no foreman
- no time slot
- LD route issue
- customer requested impossible window
- storage unit missing
- branch/dispatcher has not accepted job

The system must not silently allow this.

### Required behavior

Unassigned future jobs should create:

- Planning alert
- Decision queue item
- Reason classification
- Suggested resolution
- Escalation path

### Unassigned reason types

```text
NO_FOREMAN_AVAILABLE
NO_TRUCK_AVAILABLE
TIME_CONFLICT
FOREMAN_UNCONFIRMED
CUSTOMER_WINDOW_CONFLICT
JOB_TOO_LARGE_FOR_AVAILABLE_TRUCKS
LD_ROUTE_UNPLANNED
STORAGE_UNIT_MISSING
BRANCH_ACCEPTANCE_PENDING
OWNER_REVIEW_REQUIRED
CUSTOMER_RESCHEDULE_REQUIRED
```

### Resolution options

```text
Assign different foreman
Assign different truck
Move job time
Split job into two crews
Use overflow branch
Request owner approval
Notify customer for reschedule
Mark customer notice sent
Put on watchlist
Escalate to branch owner
```

### Assignment recommendation logic

Do not blindly assign to “whoever has fewer jobs.” Consider:

- availability
- confirmed time off
- truck availability
- truck capacity
- job type
- CuFt
- distance
- crew skill
- LD experience
- storage/packing experience
- customer language/sensitivity if known
- prior job location
- estimated finish time
- hours worked
- safety/fatigue
- claim risk
- performance history later
- branch/market scope

### Future algorithm concept

```text
Score = availability + capacity + proximity + skill + workload balance + risk fit + confirmation likelihood
```

But MVP should show recommendations, not auto-force assignments.

---

## 8. Email Role

The user prefers not to rely on email, but email will remain part of the business.

Correct approach:

```text
ArsemiaOS = source of truth
Email/SMS/WhatsApp = communication channels
```

Email should be used for:

- customer-facing confirmations
- legal documents
- time-off backup notifications
- external party communications
- fallback alerts

But every email-related action should be logged back into ArsemiaOS:

- sent status
- recipient
- timestamp
- related job/claim/quote
- response if synced later

Future backend can integrate Gmail/SendGrid/Twilio.

---

## 9. Field Event Catalog

Core events:

```text
assignment.created
assignment.notified
assignment.confirmed
assignment.declined
job.started
job.pickup_started
job.pickup_completed
job.delivery_started
job.delivery_completed
job.completed
scan.session_started
scan.item_scanned
scan.item_missing
scan.item_damaged
scan.item_cannot_scan
scan.session_completed
storage.received
storage.released
warehouse.received
warehouse.pallet_created
warehouse.pallet_loaded
warehouse.pallet_opened
trailer.loaded
trailer.received
charge.added
material.added
assistance.requested
time_off.requested
truck.inspection_submitted
claim.evidence_created
```

Every event should include:

- eventId
- actorId
- actorRole
- branchId
- jobId if applicable
- entityId
- eventType
- timestamp
- payload
- source: foreman_app / warehouse_app / owner_web / system

---

## 10. Suggested Data Models

These are original ArsemiaOS models, not copied code.

### Assignment

```ts
interface Assignment {
  assignmentId: string;
  jobId: string;
  foremanId: string;
  truckId?: string;
  branchId: string;
  date: string;
  status: 'draft' | 'notified' | 'confirmed' | 'declined' | 'needs_attention';
  notifiedAt?: string;
  confirmedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  createdBy: string;
  updatedBy?: string;
}
```

### ScanSession

```ts
interface ScanSession {
  scanSessionId: string;
  jobId: string;
  branchId: string;
  actorId: string;
  actorRole: 'foreman' | 'warehouse_operator';
  scanType:
    | 'pickup_inventory'
    | 'truck_loading'
    | 'storage_in'
    | 'storage_out'
    | 'warehouse_in'
    | 'warehouse_out'
    | 'internal_warehouse_in'
    | 'internal_warehouse_out'
    | 'delivery_scan'
    | 'final_delivery'
    | 'exception';
  startedAt: string;
  completedAt?: string;
  locationId?: string;
  truckId?: string;
  storageUnitId?: string;
  warehouseId?: string;
  status: 'open' | 'completed' | 'cancelled';
}
```

### ScanEvent

```ts
interface ScanEvent {
  scanEventId: string;
  scanSessionId: string;
  jobId: string;
  itemId: string;
  palletId?: string;
  actorId: string;
  actorRole: 'foreman' | 'warehouse_operator';
  condition: 'ok' | 'damaged' | 'missing' | 'cannot_scan' | 'unknown';
  cannotScanReason?: string;
  notes?: string;
  photoIds?: string[];
  timestamp: string;
}
```

### Pallet

```ts
interface Pallet {
  palletId: string;
  jobId: string;
  customerId: string;
  originWarehouseId?: string;
  destinationWarehouseId?: string;
  palletNumber: number;
  estimatedCuFt?: number;
  itemCount?: number;
  blanketCount?: number;
  tvBoxCount?: number;
  wardrobeCount?: number;
  shrinkWrapStatus?: 'not_started' | 'wrapped' | 'damaged';
  status: 'created' | 'loaded' | 'in_transit' | 'received' | 'opened' | 'delivered';
  currentLocationId?: string;
  trailerManifestId?: string;
}
```

### TimeOffRequest

```ts
interface TimeOffRequest {
  requestId: string;
  foremanId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  reason: 'vacation' | 'sick_leave' | 'appointment' | 'personal_reason' | 'emergency' | 'other';
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}
```

---

## 11. Sprint / Roadmap Placement

### Near-term: Operations Assignment Sprint

- Assignment Board
- assignment statuses
- foreman confirm/decline
- alerts for unassigned future jobs
- profile avatars
- future-oriented demo jobs

### Next: Foreman App Requirements Document / Portal Preparation

- document full foreman app requirements
- wire Foreman Portal to assignment confirmations
- define field event catalog

### Later: Storage / Scan Sprint

- scan sessions
- scan events
- customer/storage-job-first command center
- cannot scan reason
- not scanned list
- item custody timeline

### Later: Warehouse Operator Sprint

- warehouse operator role
- receiving workflow
- pallet creation
- staging
- warehouse incidents

### Future: Linehaul / Trailer Sprint

- trailer manifest
- pallets loaded
- warehouse lanes
- $7/mile trailer model
- profitability

---

## 12. No-Copy Implementation Rule

When implementing ArsemiaOS:

- Do not copy PoC source code.
- Do not copy PoC UI assets.
- Do not reuse proprietary endpoint structure as code.
- Do not use real PoC data.
- Do not use real customer/job/payroll/claim data.
- Build original Arsemia components, naming, styling, data models, and flows.
- Use the reference only to understand real moving-company workflow coverage.

---

## 13. Final Product Principle

The advantage is not copying PoC.

The advantage is building a cleaner system that connects everything PoC handles through fragmented app/email/manual workflows:

```text
Assignment -> Foreman confirmation -> Job execution -> Scan custody -> Storage/Warehouse -> Claims evidence -> Payroll/Invoice -> Owner audit
```

If ArsemiaOS does this well, it becomes more than a moving-company dashboard. It becomes the operating system of the moving business.


---

# Appendix A — PoC Mover APK Update Comparison Notes

Date analyzed: 2026-07-13
Files compared:
- Previous reference: `PoC Mover apk.zip` → `PoC Mover.apk`
- New uploaded APK: `PoC Mover (1).apk`

## What changed technically

This comparison was performed at the APK/package level and by inspecting the bundled Capacitor/Ionic web assets. It was not a source-code copy, source-code reuse, or attempt to clone the app. The purpose is functional reference only.

Observed package-level changes:

- The APK hash changed, so this is a different build.
- The update client version still reports `2.1.0`.
- The public route names remain essentially the same:
  - `tabs/dashboard`
  - `tabs/active-job/job`
  - `tabs/active-job/document`
  - `tabs/storage-scanning`
  - `tabs/calendar` / dashboard calendar flow
  - `tabs/notification`
  - `tabs/vacation`
  - `tabs/settings`
- The update appears more like a UI/platform/build polish than a major new workflow release.

Capacitor/plugin changes observed:

- New APK includes Capacitor Splash Screen plugin configuration.
- Splash config changed to fast/auto-hide behavior.
- Splash assets were added, including light/dark splash images/logo files.
- The previous Edge-to-Edge plugin reference is no longer present in the new `capacitor.plugins.json`.
- The old native PhotoViewer plugin reference appears removed from the web bundle, suggesting image/gallery preview may have moved toward a custom in-app gallery/lightbox pattern.

Bundle/style changes observed:

- More global styling and dark-mode related CSS exists in the new build.
- A `liquid-glass` / glass-tab style appears in the new build.
- Inventory/card styling includes more dark-mode treatment and visual refinements.

Functional string/reference changes observed:

The same major functional areas remain present:

- Scan Inventory
- Scanning Inventory
- Scan Barcode
- Cannot scan item/piece reason flow
- Scanned Items / Not Scanned Items
- Pallets: add/remove/scan/no pallets
- Storage In / Storage Out
- Warehouse In / Warehouse Out
- Internal Warehouse In / Out
- Storage Contract
- Warehouse & Foreman statement
- Materials
- Other charges
- Additional documents
- Vacation / Day Off Request
- Notifications
- Assistance / feedback / claim references

The new build has higher references to materials, charges, documents, scans, and signatures in the bundled code. This does not prove new screens by itself, but it reinforces that the Foreman app is heavily centered on:

- evidence
- documents
- charge capture
- material capture
- signatures
- scan workflow

New/changed validation reference noted:

- `too many attachments` appears in the new build.

This suggests attachment handling or validation may have been adjusted. For ArsemiaOS, this is a useful requirement: field evidence upload should enforce limits, communicate errors clearly, and preserve evidence context.

## Product lessons for ArsemiaOS

1. The Foreman App cannot be a thin mobile view. It is a field-execution and evidence-capture system.
2. Photos, document previews, galleries, attachment validation, and upload limits need to be first-class requirements.
3. Dark/light mobile readability matters because field users work in trucks, warehouses, storage units, outside, and at night.
4. Splash/load experience matters; foremen need fast access, not slow loading.
5. Scan, materials, documents, charges, signatures, and assistance should all generate structured field events that feed the Owner Web, Dispatch, Claims, Finance, Payroll, Storage, and Fleet.
6. Attachment rules should be explicit: max count, max size, allowed file types, upload failure state, retry, local pending queue, and linked job/item/claim context.

## ArsemiaOS requirement additions

Add to Foreman App requirements:

- custom evidence gallery / image preview
- photo attachment limits and clear validation errors
- “too many attachments” style guardrail
- upload retry / pending state later
- image context: job, item, scan session, claim, document, material charge, truck inspection
- dark-mode-first mobile field design
- fast launch / splash strategy
- document preview without relying on external apps when possible
- attachment permissions by role
- evidence audit trail

## Legal / IP rule

Do not copy code, assets, names, proprietary UI, or proprietary logic. Use only the observed functional workflow as industry reference. ArsemiaOS must implement its own original design, data model, wording, brand, palette, and architecture.


---

# V3 CONSOLIDATION ADDENDUM — Human Field Operations, Availability, Travel Blocks & Mobile App Rules

This addendum consolidates the new decisions made after Sprint 2.2 and its QA patches. It should be treated as part of the final Foreman App / Field Operations direction.

The core product insight is simple:

```text
The Foreman App is not a small owner dashboard.
It is a field execution tool.
It should keep the foreman moving, protect the company with evidence, and keep Operations synced.
```

Every future mobile feature must answer at least one of these questions:

```text
What does the foreman need to do next?
What evidence protects the foreman/company/customer?
What does Dispatch need to know right now?
What event should be written into the job timeline?
What downstream module is affected: Claims, Payroll, Finance, Fleet, Storage, Documents?
```

---

## 44. Foreman Does Not See Internal Pricing

The foreman should not see internal pricing logic. This is not a weakness. It is correct role separation.

The foreman can see:

```text
- assigned jobs;
- customer-facing total/balance when operationally needed;
- allowed add-on charges;
- materials used;
- additional services that can be requested or charged;
- documents required for the move;
- signatures required;
- scan/inventory status;
- payroll summary related to their own work;
- claim response requests that involve them.
```

The foreman should not see:

```text
- price per CuFt by item;
- internal pricing rules;
- quote simulator;
- company margin;
- seller strategy;
- hidden admin-charge logic;
- insurance payout strategy;
- claim settlement vs deduction logic;
- branch P&L;
- customer marketing data;
- seller conversion data.
```

### Rule

```text
Foreman executes.
Sales quotes.
Dispatch plans.
Finance audits.
Owner/Admin controls pricing.
```

This rule should be enforced in UI and data access.

---

## 45. Customer Signing Mode — Final Direction

The current field pain is that the phone moves back and forth too many times between foreman and customer.

Bad flow:

```text
Foreman taps Start Job
→ customer initials
→ foreman signature
→ customer signature
→ foreman gets phone again
```

ArsemiaOS should implement a better flow:

```text
Foreman reviews checkpoint
→ starts Customer Signing Mode
→ phone enters restricted customer mode
→ customer initials all required fields in one pass
→ customer signs once
→ customer taps Done
→ foreman regains control
→ foreman signs/closes checkpoint
→ system writes signed document + job event
```

### Customer Signing Mode rules

```text
- customer cannot navigate the app;
- customer cannot see internal notes;
- customer cannot see payroll/pricing/margin;
- customer can only read the intended document or signature summary;
- initials/signature are grouped by customer action;
- foreman finalizes after the customer is done;
- every signature step writes to the job timeline;
- document version and signature timestamp are stored.
```

### Recommended state machine

```ts
type SignatureCeremonyStatus =
  | "not_started"
  | "foreman_reviewing"
  | "customer_mode_active"
  | "customer_initials_complete"
  | "customer_signature_complete"
  | "foreman_final_review"
  | "foreman_signed"
  | "completed"
  | "cancelled";
```

### Signature event

```ts
type SignatureEvent = {
  id: string;
  jobId: string;
  legId?: string;
  documentId: string;
  actorId: string;
  actorRole: "customer" | "foreman";
  eventType:
    | "signature_ceremony_started"
    | "customer_initialed"
    | "customer_signed"
    | "foreman_signed"
    | "signature_ceremony_completed";
  timestamp: string;
  deviceId?: string;
  documentVersion: string;
};
```

---

## 46. Foreman Availability, Time Off & Recurring Schedule Rules

This is not implemented yet, but it must become a core scheduling input.

A dispatcher cannot memorize every foreman's life. The system must know who is available, who is off, who has recurring unavailable days, and who asked for a specific day off months ago.

### Use cases

```text
- Foreman requests July 16 off.
- Owner/Dispatcher approves it.
- July 15 assignment planning must not suggest that foreman for July 16.
- July 16 Foremen/Contractors must not show them as Available.
- If a job was already assigned, Operations must show a conflict.
```

Recurring examples:

```text
- Sofia is off every Sunday.
- Vuk does not work Wednesdays.
- Ravi does not work weekends.
- Nikola can work any day but prefers no Sundays.
- Dioni can work weekends but not Monday mornings.
```

### Availability model

```ts
type ForemanAvailabilityRule = {
  id: string;
  foremanId: string;
  ruleType:
    | "recurring_unavailable"
    | "recurring_preferred_off"
    | "approved_time_off"
    | "pending_time_off"
    | "custom_available_window"
    | "custom_unavailable_window";
  daysOfWeek?: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  status: "active" | "pending" | "approved" | "declined" | "cancelled";
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Time-off request model

```ts
type TimeOffRequest = {
  id: string;
  foremanId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  submittedFrom: "foreman_app" | "owner_web";
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
};
```

### Assignment suggestion rule

```text
A foreman is assignable only if:
- they are not approved off;
- they are not recurring unavailable;
- they are not already assigned to a conflicting job;
- their truck/default truck is usable or an override exists;
- the job fits capacity and timing constraints;
- no critical compliance/document block exists.
```

### UI surfaces

Owner/Dispatch should see:

```text
- Foreman Availability Calendar;
- approved/pending time-off requests;
- recurring off-day rules;
- date-specific exceptions;
- conflict warnings in Assignments;
- “not suggested because off” explanation;
- profile-level schedule tab.
```

Foreman App should allow:

```text
- request day off;
- request recurring day preference;
- see approved/declined status;
- see upcoming assigned jobs;
- receive alert if assigned during requested off day.
```

---

## 47. LD Straight Pre-Positioning / Travel Blocks

Long-distance straight jobs can require operational travel before the customer-facing pickup.

Example:

```text
Today:
- 9:00 AM local Miami job
- 1:00 PM local Miami job

Tomorrow:
- 9:00 AM pickup in Orlando
- delivery back to Miami
```

The foreman/truck may need to drive to Orlando tonight or very early tomorrow. That is not a separate customer job, but it blocks time and truck capacity.

### Recommended model

Use internal operational legs attached to a parent job.

```text
Parent Job: JOB-20491 — LD Straight Orlando → Miami
  Leg 1: Pre-positioning drive — Miami → Orlando
  Leg 2: Pickup — Orlando
  Leg 3: Delivery — Miami
  Leg 4: Driving back / return, if needed
```

### Data model

```ts
type OperationalLegType =
  | "pickup"
  | "delivery"
  | "driving_to_pickup_location"
  | "driving_back"
  | "truck_repositioning"
  | "warehouse_receiving"
  | "warehouse_staging"
  | "storage_in"
  | "storage_out";

type JobLegVisibility = "customer_facing" | "internal_operations";

type JobLeg = {
  id: string;
  parentJobId: string;
  legType: OperationalLegType;
  visibility: JobLegVisibility;
  date: string;
  startTime?: string;
  endTime?: string;
  fromAddress?: Address;
  toAddress?: Address;
  assignedForemanId?: string;
  assignedTruckId?: string;
  status: "planned" | "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
};
```

### UI rule

```text
Customer-facing jobs appear as normal job cards.
Internal travel blocks appear as operational blocks, not customer jobs.
```

### Assignment warning

If a dispatcher tries to add a late job to a foreman who must drive to a far pickup:

```text
Warning: Nikola has a pre-positioning drive to Orlando for tomorrow's 9:00 AM pickup.
Assigning another job may delay the LD Straight job.
```

### Auto-create vs auto-suggest

Recommended behavior:

```text
Auto-suggest travel blocks first.
Auto-create only after dispatcher accepts or company policy enables automatic travel blocks.
```

Because actual travel may depend on:

```text
- hotel booking;
- whether the foreman leaves tonight or early morning;
- traffic/time of day;
- branch/local crew alternative;
- customer time window;
- truck availability;
- fatigue limits.
```

---

## 48. Location: What Should Be Kept and What Should Be Removed

The user questioned whether showing a foreman's location is useful.

### Recommendation

Do not over-focus on live location in the first version.

Keep:

```text
- default base / parking lot;
- assigned branch;
- default truck parking location;
- current job pickup/delivery addresses;
- operational travel blocks;
- route estimate / distance context.
```

Remove or de-emphasize:

```text
- random static “foreman location” if it is not actionable;
- fake location labels that do not affect dispatch decisions;
- decorative map or location data with no operational use.
```

Live location can become useful later only if:

```text
- it is active-job only;
- the foreman consents and company policy supports it;
- it is shown only to authorized dispatch/owner roles;
- it has clear purpose: ETA, late risk, route issue, customer update;
- it does not become a privacy-heavy decorative feature.
```

### Practical rule

```text
Base/parking lot is useful now.
Live GPS is future.
Random profile location is optional and should be removed if it creates noise.
```

---

## 49. Foreman Rating

The rating concept is valuable because it can connect customer feedback to operational quality.

### Rating should eventually track

```text
- customer rating after move;
- on-time performance;
- claims rate;
- damage rate;
- customer compliments;
- dispatch reliability;
- documentation quality;
- photo/evidence completion;
- scan completion;
- attendance/reliability;
- recurring late arrivals;
- COI/document compliance if relevant.
```

### Important boundary

Do not turn rating into unfair punishment.

Ratings must separate:

```text
- customer mood;
- seller overpromising;
- dispatch scheduling problem;
- truck failure;
- actual foreman performance;
- helper behavior;
- warehouse damage;
- unavoidable building/customer issues.
```

### Future scoring model

```ts
type ForemanPerformanceMetric = {
  foremanId: string;
  periodStart: string;
  periodEnd: string;
  customerRatingAvg?: number;
  onTimeRate?: number;
  claimRate?: number;
  scanCompletionRate?: number;
  documentCompletionRate?: number;
  dispatchReliabilityScore?: number;
  notes?: string;
};
```

---

## 50. Demo Data Realism

Demo data must be realistic because it trains the product logic.

Bad demo data creates bad product decisions.

### Demo rules

```text
- In-city jobs should not be marked Long Distance.
- Local jobs should use plausible local neighborhoods/cities.
- Long Distance jobs should use actual long-distance destinations.
- LD Straight should show route/travel implications.
- Storage jobs should have storage-specific states.
- Claims should have realistic evidence and responsibility ambiguity.
- Foreman/truck defaults should be realistic but not overloaded randomly.
- Cancelled jobs should be counted consistently or clearly excluded.
```

### Job classification guidance

```ts
type JobClassificationHint = {
  jobId: string;
  displayedType: "local" | "commercial" | "long_distance" | "ld_straight" | "ld_consolidated" | "storage";
  reason: string;
  shouldAffectPricing: boolean;
};
```

Do not build a full pricing engine inside the demo cleanup. But every seed job should be believable.

---

## 51. Foreman App MVP vs Full Mobile App

### MVP / temporary web portal

The current web foreman portal can remain limited:

```text
- assigned jobs;
- confirm/decline assignments;
- basic payroll/expenses placeholder;
- assistance call/dispatch placeholder;
- honest “full mobile app coming later” message.
```

### Foreman Mobile v0

First mobile version should include:

```text
- today/tomorrow assignments;
- confirm/decline;
- job detail;
- customer phone/address;
- start job / pickup / delivery checkpoints;
- Customer Signing Mode;
- basic photos/evidence;
- assistance request;
- materials/charges allowed by role;
- time-off request;
- notifications;
- offline queue status.
```

### Foreman Mobile v1

Add:

```text
- barcode/QR scanning;
- inventory scanning;
- cannot-scan reason;
- storage scans;
- pallets;
- truck inspection;
- claim evidence response;
- expense receipts;
- document signatures;
- sync conflict handling.
```

---

## 52. Mobile Settings

Foreman settings should be open but limited.

Allowed:

```text
- language;
- theme: light / dark / system;
- notification preferences;
- default map app;
- camera/scanner settings;
- sync status;
- app version;
- support;
- logout.
```

Not allowed:

```text
- pricing rules;
- company settings;
- branch permissions;
- role changes;
- payroll rules;
- claim-settlement rules;
- admin/owner configuration.
```

### Theme rule

```text
Dark mode must use the Arsemia palette intentionally.
Do not create a heavy black/neon interface just because dark mode exists.
```

---

## 53. Fast App Loading / Splash Guidance

Arsemia's mobile app should feel fast.

Recommended future direction:

```ts
const mobileLaunchPolicy = {
  splash: {
    showLongSplash: false,
    showSpinnerByDefault: false,
    autoHide: true,
    background: "brand_or_system_appropriate",
  },
  loading: {
    useSkeletons: true,
    showOfflineState: true,
    showSyncQueue: true,
  },
};
```

### UX rule

```text
No fake loading.
No frozen splash.
No spinner with no context.
If data is loading, show what is loading.
If offline, show what is available locally and what is pending sync.
```

---

## 54. Field Event Catalog — Expanded

Every meaningful field action should become an event.

```text
assignment_seen_by_foreman
assignment_confirmed_by_foreman
assignment_declined_by_foreman
assignment_changed_after_sent
assignment_update_sent
foreman_called_dispatch
job_started
pickup_started
pickup_completed
delivery_started
delivery_completed
customer_signing_started
customer_initialed_document
customer_signed_document
foreman_signed_document
inventory_photo_added
inventory_scan_started
item_scanned
item_cannot_scan
pallet_created
pallet_scanned
storage_in_started
storage_in_completed
storage_out_started
storage_out_completed
warehouse_in_completed
warehouse_out_completed
material_added
additional_charge_requested
claim_issue_reported
damage_photo_added
truck_inspection_started
truck_inspection_failed
truck_issue_reported
time_off_requested
time_off_approved
time_off_declined
```

### Event model

```ts
type FieldEvent = {
  id: string;
  jobId?: string;
  legId?: string;
  actorId: string;
  actorRole: "foreman" | "warehouse_operator" | "dispatcher" | "owner" | "customer";
  eventType: string;
  timestamp: string;
  branchId?: string;
  linkedType?: "job" | "claim" | "ticket" | "document" | "truck" | "storage" | "pallet";
  linkedId?: string;
  payload: Record<string, unknown>;
};
```

---

## 55. Implementation Roadmap — Field Operations

### Do not implement all at once

Recommended order:

```text
1. Event/timeline foundation.
2. Tickets/Assistance foundation.
3. Documents/COI request flow.
4. Foreman availability/time-off rules.
5. Foreman Mobile v0.
6. Customer Signing Mode.
7. Evidence Gallery/offline queue.
8. Scan sessions.
9. Storage/Warehouse Operator mode.
10. LD travel blocks.
```

### Why Event/Timeline first?

Because every later feature needs it:

```text
Tickets need events.
Claims need events.
Documents need events.
Foreman confirmation needs events.
Pricing adjustments need events.
Storage scans need events.
```

---

## 56. Claude Implementation Guardrails For Field Operations

When this document is given to Claude:

```text
Do not implement the full Foreman App immediately.
Do not build scanner/storage/trailer all at once.
Do not expose internal pricing to foreman.
Do not invent real backend/auth if the app is still localStorage prototype.
Do not create decorative screens.
Do not duplicate source-of-truth logic.
```

Claude should be asked to produce a reconciliation report first, then implement one narrow sprint.

---

# END OF V3 ADDENDUM
