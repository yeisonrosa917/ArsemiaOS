# ARSEMIAOS — Organization, Roles, Tickets & Communications Spec

**Version:** 0.2  
**Status:** Living architecture document  
**Companion document:** `ARSEMIA_FOREMAN_APP_AND_FIELD_OPERATIONS_SPEC_v2.md`  
**Purpose:** Define how ArsemiaOS organizes people, branches/franchises, workspaces, tickets, communications, customer links, claims policy, pricing visibility, and operational ownership so the system scales without chaos.

> Product boundary: this document does not rely on copying third-party code, extracting private third-party data, or accessing any outside system. It defines original ArsemiaOS architecture, workflows, role permissions, and product rules.

---

## 1. Why This Document Exists

ArsemiaOS must prevent operational entropy. As the company grows, the natural direction of operations is disorder:

- many customers calling at once;
- many sellers touching the same lead/customer;
- jobs without foremen;
- trucks on the road without clear assignment;
- claims without ownership;
- COI/document requests floating in messages;
- tickets with no response;
- payroll/deduction disputes without evidence;
- storage/warehouse actions not connected to jobs;
- owner forced to chase every problem manually.

The system must convert that chaos into ownership, routing, evidence, and action.

Core rule:

```text
Every important record in ArsemiaOS must have:
- an owner or queue
- a status
- a priority
- a next action
- a timeline
- branch/company scope
- escalation rules when it is stuck
```

If nobody owns it, the system must surface it.

---

## 2. System Structure: Company → Branch → Workspace → User → Record

ArsemiaOS must support a small company at the beginning and a multi-branch/franchise operation later.

```text
Company
  → Branch / Franchise / Market
      → Workspace / Department
          → Team / User
              → Records / Tasks / Tickets
```

Example future structure:

```text
Arsemia Corporate
  → Miami Branch
      → Sales
      → Operations
      → Tickets
      → Claims
      → Fleet
      → Storage / Warehouse
      → Finance
      → Admin

  → New York Branch
  → Los Angeles Branch
```

The first version can still be simple:

```text
Owner = Yeison
Sales = Yeison
Dispatch = Yeison
Foreman = Yeison
Admin = Yeison
```

But the internal model must be ready for future hires:

```text
1 seller
1 dispatcher
1 claims assistant
1 documents/admin assistant
1 fleet manager
1 warehouse operator
multiple foremen
multiple branches
remote support team
```

---

## 3. Local Operations + Centralized Shared Services

ArsemiaOS should support the operating model where local branches handle physical operations while shared services handle centralized work.

### Local branch operations

Usually local:

- foremen;
- helpers;
- trucks;
- warehouse/storage;
- local dispatch;
- physical job execution;
- local incidents and truck inspections.

### Shared services

Can be centralized or remote:

- sales;
- customer support;
- claims intake;
- billing/invoices;
- documents/COI;
- communications/call center;
- quote follow-up;
- admin tasks.

Example:

```text
Seller works remotely and books a Miami job.
Miami Dispatcher assigns foreman/truck.
Miami Foreman executes the move.
Remote Claims Agent handles claim intake.
Miami Branch Owner sees all Miami-impacting work.
Main Owner sees everything.
```

Design rule:

```text
Sales can be global.
Operations must understand local capacity.
Claims can be shared, but must rely on field evidence.
Fleet is local.
Storage is local.
Finance can be centralized.
```

---

## 4. Role + Scope Model

A user's permission is not role alone. It is:

```text
Role + Scope + Workspace Access
```

Examples:

```text
Role: Main Owner
Scope: All company

Role: Branch Owner
Scope: Miami only

Role: Seller
Scope: All branches or assigned branches

Role: Dispatcher
Scope: Miami operations only

Role: Claims Agent
Scope: assigned branches or assigned claims

Role: Foreman
Scope: assigned jobs only
```

Reference TypeScript:

```ts
type WorkspaceKey =
  | "dashboard"
  | "sales"
  | "communications"
  | "operations"
  | "jobs"
  | "tickets"
  | "claims"
  | "fleet"
  | "storage"
  | "finance"
  | "reports"
  | "admin";

type UserRole =
  | "main_owner"
  | "branch_owner"
  | "sales_manager"
  | "seller"
  | "support_agent"
  | "dispatcher"
  | "foreman"
  | "helper"
  | "claims_agent"
  | "documents_admin"
  | "fleet_manager"
  | "warehouse_operator"
  | "finance_manager"
  | "viewer";

type UserScope = {
  companyId: string;
  branchIds: string[];
  allowedWorkspaces: WorkspaceKey[];
  canSeeAllBranches?: boolean;
  canAssignAcrossBranches?: boolean;
};

type ArsemiaUser = {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  scope: UserScope;
  avatarUrl?: string;
  status: "active" | "inactive" | "suspended";
  defaultBranchId?: string;
};
```

---

## 5. Workspaces

Recommended workspace layout:

```text
Dashboard
Sales
Communications Hub
Operations
Jobs
Tickets
Claims
Fleet
Storage / Warehouse
Finance
Reports
Admin
```

### Dashboard

Owner command center.

Shows:

- jobs today/tomorrow;
- unassigned jobs;
- open tickets;
- overdue tickets;
- claims requiring action;
- trucks unavailable;
- invoices overdue;
- payroll exceptions;
- branch health;
- communications volume;
- what needs owner approval.

### Sales

Handles:

- leads;
- quotes;
- follow-ups;
- quote approvals;
- booked jobs;
- lost leads;
- seller performance.

### Communications Hub

Handles:

- inbound calls;
- outbound calls;
- SMS;
- voicemail;
- missed calls;
- call dispositions;
- customer/job lookup;
- linked communication timeline;
- routing into tickets, leads, claims, documents, jobs, or invoices.

### Operations

Handles:

- dispatch board;
- assignments;
- job risk;
- foreman confirmation;
- truck assignment;
- late jobs;
- capacity conflicts.

### Jobs

The central operational record.

Handles:

- job detail;
- parent job + legs;
- timeline;
- documents;
- crew/truck;
- customer info;
- inventory;
- pricing summary by role;
- field events;
- related tickets/claims/invoices.

### Tickets

Assistance Center and internal routing system.

Handles:

- COI/document requests;
- dispatch help;
- customer issues;
- truck issues;
- claim drafts;
- missing/broken items;
- storage/warehouse issues;
- payroll/charge adjustment requests;
- escalations.

### Claims

Handles:

- damage/missing item/property damage cases;
- evidence;
- responsibility review;
- settlement;
- insurance/company coverage;
- deduction review;
- approvals;
- final closeout.

### Fleet

Handles:

- trucks;
- inspections;
- maintenance;
- documents;
- damage history;
- availability;
- assignment references.

### Storage / Warehouse

Handles:

- storage customers;
- units;
- pallets;
- scan sessions;
- warehouse in/out;
- storage in/out;
- staging;
- blocking risk;
- incidents.

### Finance

Handles:

- invoices;
- payments;
- payroll;
- reimbursements;
- deductions;
- pricing audit;
- quote margin review;
- reports.

### Reports

Owner intelligence.

Reports should answer operational questions, not just show decorative charts.

### Admin

Handles:

- users;
- roles;
- branch settings;
- document templates;
- charge rules;
- ticket routing rules;
- claim policies;
- communication settings;
- privacy/data settings.

---

## 6. Ownership Required By Record Type

Every major record must have ownership metadata.

### Lead

```ts
type LeadOwnership = {
  assignedSellerId?: string;
  branchId?: string;
  source: "website" | "phone" | "referral" | "manual" | "import" | "repeat_customer";
  nextFollowUpAt?: string;
};
```

### Quote

```ts
type QuoteOwnership = {
  createdBySellerId: string;
  assignedBranchId?: string;
  approvedById?: string;
  pricingVersionId: string;
  requiresApproval?: boolean;
};
```

### Job

```ts
type JobOwnership = {
  assignedBranchId: string;
  assignedDispatcherId?: string;
  assignedForemanId?: string;
  assignedTruckId?: string;
  lastForemanInChargeId?: string;
  sellerId?: string;
  supportOwnerId?: string;
};
```

### Ticket

```ts
type TicketOwnership = {
  assignedToId?: string;
  assignedTeam?: TicketTeam;
  branchId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  dueAt?: string;
  escalationLevel: number;
};
```

### Claim

```ts
type ClaimOwnership = {
  claimOwnerId?: string;
  branchId: string;
  linkedJobId: string;
  responsibilityReviewerId?: string;
  deductionReviewerId?: string;
};
```

### Truck

```ts
type TruckOwnership = {
  branchId: string;
  fleetOwnerId?: string;
  currentAssignedForemanId?: string;
  currentJobId?: string;
};
```

---

## 7. Communications Hub

The public-facing company number is the “magic number” of Arsemia.

It should be a business phone number connected to ArsemiaOS through a future VoIP/call-center integration.

Purpose:

```text
One public number
→ inbound/outbound calls
→ SMS
→ customer/job lookup
→ call routing
→ logs
→ tickets
→ timeline
→ owner monitoring
```

### 7.1 Core Features

The Communications Hub should support:

- one or more business phone numbers;
- inbound calls;
- outbound calls;
- SMS;
- voicemail;
- missed call queue;
- call queue;
- call routing;
- call disposition;
- internal call notes;
- optional call recordings/transcripts where legally enabled/consented;
- link communication to lead/customer/quote/job/ticket/claim/document request/invoice/branch;
- role-scoped visibility;
- dashboards for volume, missed calls, response time, unresolved calls.

### 7.2 Intake Script

When a customer calls, the intake starts simple:

```text
“Thank you for calling Arsemia. May I have your name and job number, if you have one?”
```

Then the agent classifies the reason:

- new quote;
- existing move update;
- COI/document request;
- payment/invoice;
- claim/damage;
- delivery/pickup update;
- storage;
- complaint;
- reschedule;
- other.

### 7.3 Communication Linking

Every communication should be linked whenever possible:

```ts
type CommunicationLink = {
  leadId?: string;
  customerId?: string;
  quoteId?: string;
  jobId?: string;
  ticketId?: string;
  claimId?: string;
  documentRequestId?: string;
  invoiceId?: string;
  branchId?: string;
};
```

### 7.4 Call Dispositions

```ts
type CallDisposition =
  | "new_lead"
  | "quote_follow_up"
  | "job_update"
  | "coi_request"
  | "document_request"
  | "payment_question"
  | "claim_intake"
  | "complaint"
  | "dispatch_issue"
  | "storage_question"
  | "resolved_no_action"
  | "callback_needed";
```

### 7.5 Owner Freedom

The owner should not need to answer every call.

The owner needs visibility into:

- missed calls;
- unresolved calls;
- urgent customer issues;
- tickets overdue;
- calls that created claims;
- calls requiring owner approval;
- branches with high call volume;
- employees not closing loops.

Owner freedom comes from organized routing, not from ignoring operations.

---

## 8. Tickets / Assistance Center

The Tickets module is the central router for work that needs action.

Foreman App Assistance should create tickets. Communications Hub should create tickets. Owner/Admin can create tickets manually. Jobs, Claims, Documents, Fleet, Storage and Finance can also create tickets.

### 8.1 Ticket Teams

```ts
type TicketTeam =
  | "dispatch"
  | "sales"
  | "support"
  | "documents"
  | "claims"
  | "fleet"
  | "storage"
  | "warehouse"
  | "finance"
  | "payroll"
  | "owner_review";
```

### 8.2 Ticket Types

```ts
type TicketType =
  | "dispatch_help"
  | "late_arrival"
  | "coi_needed"
  | "document_request"
  | "customer_issue"
  | "claim_draft"
  | "broken_item"
  | "missing_item"
  | "property_damage"
  | "truck_issue"
  | "storage_issue"
  | "warehouse_issue"
  | "payroll_adjustment"
  | "charge_adjustment"
  | "invoice_question"
  | "other";
```

### 8.3 Ticket Statuses

```ts
type TicketStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "waiting_customer"
  | "waiting_foreman"
  | "waiting_admin"
  | "waiting_owner"
  | "resolved"
  | "closed";
```

### 8.4 Ticket Model

```ts
type Ticket = {
  id: string;
  ticketNumber: string;
  type: TicketType;
  team: TicketTeam;
  status: TicketStatus;
  priority: "low" | "normal" | "high" | "urgent";

  companyId: string;
  branchId?: string;

  linkedLeadId?: string;
  linkedCustomerId?: string;
  linkedQuoteId?: string;
  linkedJobId?: string;
  linkedClaimId?: string;
  linkedTruckId?: string;
  linkedInvoiceId?: string;
  linkedDocumentRequestId?: string;

  createdById: string;
  assignedToId?: string;
  dueAt?: string;
  escalationLevel: number;

  title: string;
  description?: string;
  internalNotes?: string;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
};
```

### 8.5 Routing Examples

#### COI Needed

```text
Foreman → Assistance → COI Needed
→ creates Ticket(type: coi_needed, team: documents)
→ creates/links DocumentRequest
→ appears in Tickets + Documents/Admin
→ Admin/Sales/Dispatch uploads or selects COI
→ COI attaches to Job Documents
→ COI can be sent to customer/building/property manager
→ Foreman receives notification: COI sent / pending / ready
```

#### Broken Item

```text
Foreman → Assistance → Broken Item
→ creates Ticket(type: broken_item, team: claims)
→ creates ClaimDraft
→ requires photos/notes/item link where available
→ appears in Claims
→ links to Job Timeline
```

#### Truck Issue

```text
Foreman → Assistance → Truck Issue
→ creates Ticket(type: truck_issue, team: fleet)
→ creates FleetIssue
→ can mark truck unavailable
→ Operations sees assignment risk
```

#### Late Arrival

```text
Foreman → Assistance → Late Arrival
→ creates Ticket(type: late_arrival, team: dispatch)
→ Operations sees customer risk
→ customer support can notify customer if needed
```

### 8.6 Unassigned and Overdue Queues

Mandatory queues:

```text
Unassigned Tickets
Overdue Tickets
Urgent Tickets
Tickets Waiting Owner
Tickets Waiting Foreman
Tickets Waiting Customer
Tickets by Branch
Tickets by Team
```

---

## 9. Documents, COI & Templates

Documents are not random PDFs. They are operational objects.

### 9.1 Document Types

```ts
type DocumentType =
  | "coi"
  | "binding_quote"
  | "agreement"
  | "move_confirmation"
  | "invoice"
  | "payment_receipt"
  | "storage_contract"
  | "storage_receipt"
  | "warehouse_statement"
  | "foreman_statement"
  | "delivery_receipt"
  | "claim_form"
  | "inventory_report"
  | "bingo_summary"
  | "other";
```

### 9.2 COI Flow

COI requests should be handled as DocumentRequests, not loose messages.

```text
COI requested
→ DocumentRequest created
→ assigned to Documents/Admin/Sales
→ linked to Job
→ COI generated/uploaded/selected
→ attached to Job Documents
→ sent to customer/building/property manager as needed
→ communication logged
→ foreman notified of status
```

Foreman should see status, not internal insurance details.

### 9.3 DocumentRequest Model

```ts
type DocumentRequest = {
  id: string;
  type: DocumentType;
  status: "requested" | "in_progress" | "ready" | "sent" | "cancelled";
  linkedJobId?: string;
  linkedCustomerId?: string;
  requestedById: string;
  assignedToId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  notes?: string;
  createdAt: string;
  sentAt?: string;
};
```

---

## 10. Customer Move Link

Arsemia should not start with a heavy customer portal requiring account creation.

Moving customers usually want simplicity:

- no account;
- no password;
- fast access;
- clear next step;
- documents/payment/status in one place.

### 10.1 Recommended Model

Use a secure, no-login customer move link:

```text
arsemiamove.com/move/private-access-token
```

Not:

```text
arsemiamove.com/move/JOB-10421
```

Never allow job number alone to reveal move information.

### 10.2 Delivery Channels

Send the link by:

- SMS for quick access;
- email for formal records/documents;
- WhatsApp in the future.

Each send/resend must be logged in the Job Timeline.

### 10.3 Customer Link Rules

```text
- token must be long and unguessable
- link must be revocable
- link should expire or be renewable
- no Google indexing
- do not cache sensitive customer details publicly
- log access events
- optionally require lightweight verification for sensitive data
```

Light verification options:

- last 4 digits of phone;
- ZIP code;
- email code;
- SMS code.

### 10.4 Customer Link Use Cases

Customer can:

- review/approve quote;
- sign documents;
- see basic move status;
- view invoice/payment link;
- upload claim photos;
- view claim status;
- view storage status in future;
- access COI/documents sent to them.

Customer cannot see:

- internal notes;
- payroll;
- foreman deductions;
- margin;
- claim responsibility debates;
- internal operations logs.

---

## 11. Foreman Access Limits

Foreman is a field execution role, not an internal office role.

Foreman should see:

- assigned jobs;
- job details needed for execution;
- customer name/phone;
- pickup/delivery addresses;
- documents required for move execution;
- start/pickup/delivery workflow;
- inventory/scanning;
- evidence/photos;
- materials used;
- allowed additional charges;
- assistance;
- truck inspection;
- time off;
- notifications;
- basic payroll view;
- claim response requests.

Foreman should not see:

- internal pricing rules;
- CuFt price per item;
- margin;
- seller strategy;
- quote simulator;
- internal admin charge logic;
- company profit;
- claim settlement internals;
- insurance payout internals;
- branch financials;
- customer marketing data.

Rule:

```text
Foreman executes.
Owner/Admin/Sales quote.
Finance audits.
Claims reviews responsibility.
```

---

## 12. Pricing Visibility By Role

Pricing Intelligence and Quote Audit Lab belong in Owner/Admin Web, not Foreman App.

### 12.1 Owner/Admin/Sales Advanced

Can access:

- pricing rules;
- charge dictionary;
- quote simulator;
- admin surcharge definitions;
- margin estimate;
- commissionable/non-commissionable logic;
- pricing versioning;
- approval rules;
- quote audit warnings.

### 12.2 Foreman

Can access only customer-facing or execution-relevant values:

- customer total/balance if needed;
- materials added;
- allowed charges;
- approved additional services;
- payment status if needed for field execution.

No internal margin or pricing logic.

### 12.3 Quote Simulator Placement

Quote Simulator should be an advanced collapsed panel, not a default seller screen.

```text
Advanced Pricing / What-if
```

It should answer:

- What if LD Straight?
- What if trailer/linehaul later?
- What if storage is needed?
- What if operating branch changes?
- What if discount is added?
- What if CuFt changes?

Outputs:

- customer price;
- estimated cost;
- margin estimate;
- approval needed;
- warnings.

---

## 13. Claims, Insurance, Coverage & Deductions

Claims settlement and foreman deduction must be separate concepts.

A company may settle with a customer, use insurance, absorb cost, or review responsibility. That does not automatically mean the foreman should pay 100%.

### 13.1 Core Policy

```text
No automatic 100% deduction.
No deduction without evidence.
No deduction before responsibility is confirmed.
No deduction without owner/accounting approval.
Claim settlement and payroll deduction are separate records.
```

### 13.2 Claim Financial Layers

```ts
type ClaimFinancials = {
  customerClaimAmount?: number;
  customerSettlementAmount?: number;
  insuranceCoverageAmount?: number;
  companyCoverageAmount?: number;
  proposedForemanDeduction?: number;
  approvedForemanDeduction?: number;
  deductionApprovedById?: string;
  policyVersionId: string;
};
```

### 13.3 Claim Statuses

```ts
type ClaimStatus =
  | "new"
  | "needs_evidence"
  | "waiting_foreman_response"
  | "waiting_customer_response"
  | "under_review"
  | "responsibility_review"
  | "settlement_pending"
  | "deduction_review"
  | "approved"
  | "denied"
  | "closed";
```

### 13.4 Responsibility Evidence

Claims should use:

- photos;
- item scans;
- last known good condition;
- first damaged scan/report;
- truck/warehouse/pallet events;
- foreman response;
- customer response;
- signatures;
- job leg responsibility.

### 13.5 Traffic Tickets

Traffic tickets should be modeled separately from item/property claims.

```ts
type TrafficTicketRecord = {
  id: string;
  linkedJobId?: string;
  linkedTruckId?: string;
  responsibleForemanId?: string;
  amount: number;
  companyShare?: number;
  foremanShare?: number;
  status: "reported" | "under_review" | "approved" | "deducted" | "closed";
  evidenceAttachmentIds: string[];
  approvedById?: string;
};
```

Policy example:

```text
Traffic ticket split can be 50/50 when policy says so and responsibility is confirmed.
```

---

## 14. Last Foreman In Charge

The job record must track operational responsibility over time.

Required concepts:

```text
current foreman
last foreman in charge
previous foremen
responsible foreman by leg
```

Reference:

```ts
type JobLegResponsibility = {
  legId: string;
  legType: "pickup" | "driving_day" | "delivery" | "return_day" | "storage_in" | "storage_out" | "warehouse";
  foremanId?: string;
  warehouseOperatorId?: string;
  truckId?: string;
  startedAt?: string;
  completedAt?: string;
};
```

Uses:

- claims;
- payroll;
- customer questions;
- responsibility review;
- dispatch history;
- job timeline.

---

## 15. Queues By Department

Every workspace should have a queue.

### Sales Queue

- new leads;
- quotes pending;
- follow-ups overdue;
- quote needs approval;
- customer waiting.

### Operations Queue

- jobs unassigned;
- foreman unconfirmed;
- truck missing;
- route/time conflict;
- late job;
- capacity risk.

### Tickets Queue

- unassigned tickets;
- urgent tickets;
- overdue tickets;
- waiting customer;
- waiting foreman;
- waiting owner.

### Claims Queue

- new claim;
- needs evidence;
- waiting foreman response;
- waiting customer response;
- responsibility review;
- deduction pending approval.

### Fleet Queue

- truck issue;
- inspection failed;
- maintenance due;
- registration/insurance expiring;
- truck unavailable.

### Documents Queue

- COI needed;
- contract unsigned;
- invoice requested;
- storage contract missing;
- claim document pending.

### Finance Queue

- invoice unpaid;
- payment mismatch;
- payroll review;
- deduction review;
- refund/credit pending.

---

## 16. Escalation Rules

Stuck work must escalate.

Examples:

```text
COI requested
→ if not resolved within 2 hours, alert Documents/Admin
→ if still pending, alert Branch Owner

Job tomorrow without foreman
→ high priority Operations alert
→ alert Dispatcher
→ if still unresolved, alert Branch Owner

Claim new for 24h without review
→ alert Claims Agent
→ then Branch Owner

Urgent ticket without owner
→ alert workspace manager
→ then Main Owner
```

Reference model:

```ts
type EscalationRule = {
  id: string;
  appliesTo: "ticket" | "claim" | "job" | "document_request" | "fleet_issue";
  condition: string;
  afterMinutes: number;
  notifyRole: UserRole;
  notifyUserId?: string;
  priorityBump?: "high" | "urgent";
};
```

---

## 17. Workload Control

ArsemiaOS should help the owner know when to hire.

### Seller workload

- leads assigned;
- quotes pending;
- overdue follow-ups;
- response time;
- conversion rate;
- revenue booked.

### Dispatcher workload

- jobs assigned;
- unassigned jobs;
- foreman confirmations pending;
- truck conflicts;
- late jobs.

### Claims workload

- claims open;
- claims overdue;
- average days open;
- claims waiting evidence;
- claims by branch/foreman/job type.

### Fleet workload

- trucks available;
- trucks down;
- maintenance due;
- inspections failed;
- issues per truck.

### Support workload

- calls handled;
- missed calls;
- callbacks pending;
- tickets created;
- tickets resolved;
- average resolution time.

---

## 18. Data Ownership & Safe CRM Growth

ArsemiaOS should capture its own data from day one.

It should support:

- customers;
- leads;
- jobs;
- quotes;
- invoices;
- claims;
- payments;
- follow-ups;
- marketing consent;
- authorized imports;
- exports.

### 18.1 Customer Data Model

```ts
type Customer = {
  id: string;
  displayName: string;
  phone?: string;
  email?: string;
  preferredLanguage?: "en" | "es" | "other";
  marketingConsent?: MarketingConsent;
  createdAt: string;
  updatedAt: string;
};

type MarketingConsent = {
  emailOptIn: boolean;
  smsOptIn: boolean;
  source: "website" | "quote_form" | "manual" | "referral" | "authorized_import";
  consentDate?: string;
  consentNote?: string;
  unsubscribedAt?: string;
};
```

### 18.2 Import / Export

Allowed future tools:

- CSV import;
- CSV export;
- authorized migration;
- demo data;
- manual entry;
- customer opt-in capture.

Rule:

```text
ArsemiaOS must not trap the owner's data. The owner must be able to export operational and customer records they own.
```

---

## 19. Activity Timeline / Event System

The trunk of the project is connection.

Every action should create an event and link to the correct area.

Examples:

```text
ticket_created
coi_requested
coi_sent
foreman_assigned
foreman_confirmed
truck_issue_reported
claim_opened
photo_uploaded
deduction_review_started
invoice_sent
payment_received
call_logged
sms_sent
customer_link_opened
```

Reference:

```ts
type SystemEvent = {
  id: string;
  eventType: string;
  actorId: string;
  actorRole: UserRole;
  companyId: string;
  branchId?: string;

  linkedLeadId?: string;
  linkedCustomerId?: string;
  linkedQuoteId?: string;
  linkedJobId?: string;
  linkedTicketId?: string;
  linkedClaimId?: string;
  linkedTruckId?: string;
  linkedDocumentRequestId?: string;
  linkedInvoiceId?: string;

  beforeValue?: unknown;
  afterValue?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
```

---

## 20. Implementation Roadmap

This document is architecture. Do not implement everything at once.

### Phase A — Documentation only

- Add this MD to repo.
- Keep existing Foreman/Field Operations MD.
- Ask Claude to read both as architecture references.
- No code implementation from this MD until current sprint is stable.

### Phase B — Data dictionaries

Implement stable config dictionaries:

```text
src/lib/config/workspaces.ts
src/lib/config/roles.ts
src/lib/config/ticket-types.ts
src/lib/config/document-types.ts
src/lib/config/claim-statuses.ts
src/lib/config/communication-dispositions.ts
```

### Phase C — Tickets foundation

- Create Tickets workspace shell.
- Create mock tickets.
- Link tickets to jobs/customers/claims/documents.
- Add status/priority/owner.
- Add unassigned/overdue views.

### Phase D — Communications Hub shell

- Create Communications workspace shell.
- Mock call/SMS logs.
- Link logs to customer/job/ticket.
- Add missed calls/callback queue.
- No real phone integration yet.

### Phase E — DocumentRequest / COI workflow

- Add DocumentRequest model.
- Add COI request ticket type.
- Attach document to job.
- Simulate send to customer/building.
- Log in timeline.

### Phase F — Claims policy foundation

- Separate customer settlement from foreman deduction.
- Add claim financial layers.
- Add deduction review status.
- Add evidence/approval requirements.

### Phase G — Pricing visibility by role

- Keep Pricing Audit Lab Owner/Admin only.
- Hide internal pricing from Foreman App.
- Add role-based visibility rules.

---

## 21. What Not To Build Yet

Do not build yet:

- real VoIP integration;
- real call recording;
- real SMS sending;
- real WhatsApp integration;
- real payment processing;
- real auth backend;
- full customer account portal;
- AI call agent;
- full franchise billing;
- production legal/tax automation.

Build clean architecture first.

---

## 22. Acceptance Principles

A feature is not accepted if it is only decorative.

Each feature must answer at least one of these:

```text
What decision does it help make?
What error does it prevent?
What money does it protect?
What responsibility does it clarify?
What process does it accelerate?
What evidence does it leave?
```

Core operating principle:

```text
ArsemiaOS is not a collection of screens.
ArsemiaOS is an operating system where every action creates state, evidence, responsibility, and money visibility.
```

---

## 23. Claude Usage Instructions

When Claude reads this file:

1. Do not immediately implement everything.
2. Treat this as architecture and product law.
3. Keep current sprint scope.
4. If implementation is requested later, implement one small sprint at a time.
5. Preserve owner-first design.
6. Preserve role + scope permissions.
7. Avoid filler UI.
8. Avoid dead buttons.
9. Every new workflow must connect to Jobs, Tickets, Timeline, or a proper workspace.



---

# V2 CONSOLIDATION ADDENDUM — Owner OS, Roles, Tickets, Communications, Availability & Pricing Boundaries

This addendum consolidates the product decisions made after Sprint 2.2 and its QA patches.

The Owner OS must turn chaos into ordered work. The owner should not have to manually chase every customer, every truck, every claim, every foreman, every seller, every COI, every adjustment, and every schedule conflict.

Core rule:

```text
Every important record must have:
- owner or queue;
- status;
- priority;
- next action;
- timeline;
- branch/company scope;
- escalation rule.
```

If nobody owns it, the system must surface it.

---

## 35. Workspaces: Final Direction

ArsemiaOS should organize work around human responsibility, not random pages.

Recommended top-level workspaces:

```text
Dashboard
Sales
Operations
Jobs
Tickets / Assistance Center
Claims
Fleet
Storage / Warehouse
Finance
Reports
Admin / Settings
```

### Workspace responsibility

| Workspace | Main question answered |
|---|---|
| Dashboard | What needs my attention now? |
| Sales | What leads/quotes need action? |
| Operations | What is happening today/tomorrow? |
| Jobs | What jobs exist and what is their status? |
| Tickets | What issues/request need owners? |
| Claims | What damage/loss disputes need evidence/decision? |
| Fleet | What trucks are usable, assigned, down, or due? |
| Storage | What is in storage/warehouse and what must move? |
| Finance | What has been billed, paid, reimbursed, or owed? |
| Reports | What patterns explain performance and risk? |
| Admin | Who has access, settings, documents, rules? |

---

## 36. Role + Scope Model

A user is not defined only by role. A user has a role and a scope.

```text
Role = what the user can do.
Scope = where/how far the user can do it.
```

Examples:

```text
Main Owner — all company, all branches, all workspaces.
Branch Owner — Miami branch only.
Seller — all branches, Sales workspace, limited customer/job data.
Dispatcher — assigned branch, Operations/Jobs/Foremen/Fleet.
Claims Agent — assigned claims and evidence, limited financial access.
Documents/Admin — COI/contracts/invoices/docs, limited pricing access.
Foreman — own assignments and execution only.
Warehouse Operator — storage/warehouse scanning only.
Finance — invoices/payroll/reimbursements, limited ops access.
```

### Data model

```ts
type WorkspaceKey =
  | "dashboard"
  | "sales"
  | "operations"
  | "jobs"
  | "tickets"
  | "claims"
  | "fleet"
  | "storage"
  | "finance"
  | "reports"
  | "admin";

type UserRole =
  | "main_owner"
  | "branch_owner"
  | "seller"
  | "dispatcher"
  | "claims_agent"
  | "documents_admin"
  | "fleet_manager"
  | "warehouse_operator"
  | "finance_admin"
  | "foreman"
  | "customer_link_user";

type UserScope = {
  companyId: string;
  branchIds: string[];
  workspaceKeys: WorkspaceKey[];
  canSeeAllBranches?: boolean;
  canOverrideBranch?: boolean;
};
```

---

## 37. Centralized Sales / Support + Local Branch Operations

ArsemiaOS should support a structure where sales/support can be centralized or remote while field operations remain local.

```text
Corporate / Main Owner
  → Shared Sales Team
  → Shared Support Team
  → Shared Documents/COI Team
  → Shared Claims Team
  → Shared Billing/Finance
  → Local Branch Operations
      → Foremen
      → Trucks
      → Dispatch
      → Warehouse/Storage
```

### Why this matters

A branch owner can travel or step away if the system has:

```text
- remote sellers;
- centralized communications;
- ticket routing;
- local dispatch visibility;
- foreman confirmation;
- truck assignment;
- claims ownership;
- documents workflow;
- escalation rules;
- owner dashboard.
```

The owner should monitor exceptions, not personally answer every call.

---

## 38. Communications Hub

The preferred name is **Communications Hub**.

It should become the company communication nerve center.

### Public business number

Arsemia can have one public business number:

```text
Inbound calls
Outbound calls
SMS
Voicemail
Future WhatsApp
```

That number should route into ArsemiaOS.

### Intake script

When an existing customer calls:

```text
“Can I have your name and job number?”
```

Then the agent opens:

```text
Customer
Job
Quote
Ticket
Claim
Document Request
Invoice
```

### Communication record

```ts
type CommunicationRecord = {
  id: string;
  channel: "call" | "sms" | "email" | "whatsapp" | "voicemail";
  direction: "inbound" | "outbound";
  from: string;
  to: string;
  handledBy?: string;
  branchId?: string;
  linkedType?: "lead" | "customer" | "quote" | "job" | "ticket" | "claim" | "document_request" | "invoice";
  linkedId?: string;
  disposition?: string;
  summary?: string;
  startedAt: string;
  endedAt?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  consentStatus?: "not_required" | "consented" | "unknown" | "disabled";
};
```

### Monitoring rule

Call recordings/transcripts should exist only where legally enabled and with proper consent/policy. The product should support logs and dispositions first, recording/transcription later.

### Queues

```text
Sales queue
Support queue
Documents/COI queue
Claims queue
Billing queue
Dispatch queue
Storage queue
```

### Communication must feed Tickets

If a call requires action, it should become or update a ticket.

```text
Call about COI → DocumentRequest ticket.
Call about damage → Claim ticket.
Call about arrival time → Dispatch ticket/update.
Call about balance → Billing ticket.
```

---

## 39. Tickets / Assistance Center

The system should have a dedicated **Tickets / Assistance Center**.

This is where operational exceptions become owned work.

### Ticket sources

```text
Foreman App Assistance
Customer call
SMS/email
Owner/Admin manual entry
Job Detail
Claim intake
Fleet issue
Document request
Finance dispute
Storage/warehouse issue
```

### Ticket types

```text
Dispatch issue
COI / document request
Customer issue
Truck issue
Late arrival
Broken item
Missing item
Property damage
Items left in truck
Storage issue
Warehouse issue
Payroll / charge adjustment
Billing/payment issue
Seller promise issue
Other
```

### Ticket model

```ts
type TicketType =
  | "dispatch_issue"
  | "document_request"
  | "coi_request"
  | "customer_issue"
  | "fleet_issue"
  | "late_arrival"
  | "claim_draft"
  | "missing_item"
  | "broken_item"
  | "property_damage"
  | "items_left_in_truck"
  | "storage_issue"
  | "warehouse_issue"
  | "payroll_adjustment"
  | "billing_issue"
  | "seller_promise_issue"
  | "other";

type TicketStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "waiting_customer"
  | "waiting_foreman"
  | "waiting_admin"
  | "waiting_documents"
  | "waiting_owner_approval"
  | "resolved"
  | "closed";

type Ticket = {
  id: string;
  ticketNumber: string;
  type: TicketType;
  status: TicketStatus;
  priority: "low" | "normal" | "high" | "urgent";
  title: string;
  description?: string;
  branchId?: string;
  ownerId?: string;
  queue: "sales" | "operations" | "documents" | "claims" | "fleet" | "storage" | "finance" | "admin";
  linkedJobId?: string;
  linkedCustomerId?: string;
  linkedClaimId?: string;
  linkedDocumentRequestId?: string;
  dueAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};
```

### Assistance routing examples

```text
Foreman → Assistance → COI needed
→ Ticket: DocumentRequest / COI
→ Documents/Admin queue
→ linked Job Documents
→ sent to customer/building/property manager
→ foreman notified: COI sent
```

```text
Foreman → Assistance → Broken item
→ Ticket: ClaimDraft
→ Claims queue
→ requires photos/evidence
→ linked job timeline
```

```text
Foreman → Assistance → Truck issue
→ Ticket: FleetIssue
→ Fleet queue + Operations alert
→ truck may be blocked from assignment suggestions
```

---

## 40. Documents, COI & Templates

COI should be both attached to the job and sent to the right person.

### COI flow

```text
Foreman / Customer / Admin requests COI
→ DocumentRequest created
→ linked to Job
→ Admin/Documents selects/generates COI
→ COI stored in Job Documents
→ sent to customer, building, property manager, or front desk
→ delivery logged
→ foreman sees status only
```

### Foreman visibility

Foreman should see:

```text
COI requested
COI pending
COI sent
COI approved/received, if tracked
```

Foreman should not see:

```text
internal insurance policy details;
company/admin notes;
insurance payout or risk discussions;
unrelated corporate documents.
```

### Document request model

```ts
type DocumentRequest = {
  id: string;
  jobId: string;
  type: "coi" | "contract" | "invoice" | "receipt" | "storage_contract" | "claim_form" | "other";
  requestedBy: string;
  requestedFrom: "foreman_app" | "customer_call" | "owner_web" | "sales" | "dispatch";
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  buildingOrProperty?: string;
  status: "requested" | "in_progress" | "sent" | "received" | "cancelled";
  linkedDocumentId?: string;
  createdAt: string;
  sentAt?: string;
};
```

---

## 41. Customer Move Link — Simple, Not a Full Portal

A moving customer usually does not want to create an account. They want a simple link.

### MVP recommendation

```text
No full customer portal at MVP.
Use a secure, no-login, expiring Customer Move Link.
```

Example concept:

```text
arsemiamove.com/move/private-access-token
```

Do not expose details by job number alone.

Bad:

```text
arsemiamove.com/move/JOB-10421
```

Good:

```text
arsemiamove.com/move/long-random-token
```

### Delivery channels

```text
SMS = quick access.
Email = formal documents.
WhatsApp = future optional.
```

### Customer link features

```text
- quote approval;
- document viewing/signature;
- COI/document download if appropriate;
- payment link;
- basic move status;
- claim submission;
- storage status later;
- secure upload of photos/documents later.
```

### Security rules

```text
- long unguessable token;
- expires;
- revocable;
- not indexable;
- do not cache sensitive data publicly;
- log access;
- optional verification for sensitive details: last 4 phone digits, ZIP, email/SMS code.
```

---

## 42. Pricing Visibility & Pricing Intelligence Boundary

Pricing Intelligence belongs to Owner/Admin/Sales/Finance, not Foreman App.

### Foreman can see

```text
- customer-facing total/balance if needed;
- allowed additional charges;
- materials added;
- customer-facing documents if needed.
```

### Foreman cannot see

```text
- item CuFt pricing logic;
- quote simulator;
- margin;
- sales strategy;
- admin surcharge internal logic;
- commissionable/non-commissionable internals;
- branch profitability.
```

### Pricing Intelligence / Quote Audit Lab

Owner/Admin tool for:

```text
- CuFt;
- mileage;
- fuel;
- tolls;
- admin surcharge;
- line haul;
- materials;
- packing;
- storage;
- handling;
- special requests;
- discounts;
- claim credits;
- commissionable total;
- margin estimate;
- warning flags.
```

### Admin surcharge rule

```text
Do not call an admin surcharge a tax unless it is legally a tax.
Treat it as a configurable company fee unless configured otherwise.
```

---

## 43. Claims, Insurance, Tickets & Deductions

Claims must not automatically equal foreman deductions.

Separate layers:

```text
Customer claim amount
Customer settlement
Insurance coverage
Company absorption
Foreman responsibility
Payroll deduction
Owner/accounting approval
```

### Claim model extension

```ts
type ClaimFinancialResolution = {
  claimId: string;
  customerRequestedAmount?: number;
  customerSettlementAmount?: number;
  insuranceCoverageAmount?: number;
  companyAbsorbedAmount?: number;
  proposedForemanDeductionAmount?: number;
  approvedForemanDeductionAmount?: number;
  deductionStatus: "none" | "proposed" | "under_review" | "approved" | "rejected" | "paid";
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
};
```

### Deduction rules

```text
No automatic 100% deduction.
No deduction without evidence.
No deduction before responsibility is determined.
No deduction without owner/accounting approval.
Claim settlement and payroll deduction are different objects.
```

### Traffic ticket policy

Traffic tickets can be modeled separately:

```text
Traffic Ticket
→ responsible foreman
→ company share
→ foreman share
→ receipt/evidence
→ payroll deduction review
```

---

## 44. Foreman Scheduling & Availability System

This is not implemented yet, but it should be a high-priority future sprint because it directly affects Assignments.

### Purpose

```text
Dispatcher should not memorize 100 foremen's weekly availability.
The system should know who can work, who is off, who requested time off, and who should not be suggested.
```

### Inputs

```text
- approved time off;
- pending time off;
- recurring unavailable days;
- preferred days off;
- custom windows;
- branch/base;
- truck availability;
- existing assignments;
- LD travel blocks;
- fatigue/long-day warning later.
```

### UI surfaces

```text
Foremen profile → Availability tab
Operations/Assignments → suggestion engine
Alerts → assignment conflicts
Foreman App → request time off
Owner/Dispatcher → approve/decline requests
Calendar → off days and unavailable periods
```

### Scheduling rule

```text
Assignments should not suggest a foreman for a date where they are approved off or recurring unavailable.
If already assigned, the system must create a conflict alert.
```

---

## 45. LD Straight / Operational Travel Blocks

LD Straight can require pre-positioning.

This should be modeled as an internal operational block, not a customer-facing job.

Examples:

```text
Driving to pickup location
Driving back
Truck repositioning
Overnight travel
```

This affects:

```text
- foreman availability;
- truck availability;
- time conflicts;
- fatigue warnings;
- route planning;
- payroll/travel policy;
- hotel/reimbursement planning;
- foreman app schedule.
```

---

## 46. Owner Dashboard: Freedom Through Exceptions

The goal is not for the owner to click everything manually.

The owner should see exceptions:

```text
5 jobs unassigned tomorrow
3 foremen not confirmed
1 foreman declined
2 trucks in shop
4 COIs pending
8 tickets overdue
2 claims waiting evidence
1 deduction needs approval
3 invoices unpaid
```

That is how the owner can travel, hire remote staff, and monitor the business without being trapped in every call.

---

## 47. Data Ownership & Safe Imports

ArsemiaOS should own its own operational data from day one.

Safe sources:

```text
- Arsemia customer submissions;
- Arsemia jobs;
- authorized CSV imports;
- manually entered records;
- demo data;
- public data;
- consent-based marketing contacts.
```

Features:

```text
CSV import
CSV export
customer consent tracking
marketing opt-in/out
unsubscribe state
data deletion/export tools
role-scoped PII access
audit logs
```

### Marketing consent model

```ts
type MarketingConsent = {
  customerId: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  source: "website" | "quote_form" | "manual" | "referral" | "import";
  consentDate?: string;
  consentNote?: string;
  unsubscribedAt?: string;
};
```

---

## 48. Demo Data Realism & QA Rules

Demo data must be realistic. It should not teach the app bad logic.

### Rules

```text
- Local moves should be local.
- Long Distance should be actual long distance.
- Commercial jobs should look commercial.
- Storage jobs should have storage states.
- Foremen should have plausible default trucks.
- Trucks should not randomly conflict unless demo intentionally demonstrates conflict.
- Cancelled jobs should be counted consistently or clearly labeled.
- Jobs and Operations should use the same source of truth.
```

### QA checklist

```text
Same selected date = same jobs in Jobs and Operations.
0 jobs = no fake map/route.
Available foreman with no job = not On Job.
Date-scoped counts are date-scoped.
Global views are clearly labeled as global.
```

---

## 49. Claude Sprint Discipline

Do not give Claude monster implementation prompts.

Process:

```text
1. Add architecture docs to repo.
2. Ask Claude for reconciliation report only.
3. Pick one next sprint.
4. Implement one dependency at a time.
5. Run tsc/lint/build.
6. Do manual QA.
7. Patch before moving forward.
```

### Best next sprint candidates

After Sprint 2.2 and QA patches, likely candidates:

```text
A. Job Detail Timeline / Event System foundation
B. Tickets / Assistance Center foundation
C. Documents / COI request flow
D. Foreman Availability & Time-Off Rules
E. Foreman App v0 preparation
```

Recommended dependency order:

```text
1. Event/Timeline foundation
2. Tickets/Assistance foundation
3. Documents/COI request flow
4. Availability/Time-Off rules
5. Foreman App v0
```

Reason:

```text
Tickets, claims, documents, availability conflicts, and foreman mobile actions all need a reliable event/timeline base.
```

---

## 50. Reconciliation Prompt For Claude

Use after both MDs are committed.

```text
Read the architecture documents under docs/architecture.
Do not implement.
Do not edit files.
Produce a reconciliation report only.

Explain:
1. What the current app already supports.
2. What is now stable enough to build on.
3. What conflicts with the architecture direction.
4. What is missing.
5. Which next sprint should come first and why.
6. What must stay out of scope.
7. Suggested implementation plan for that one sprint only.
Stop after the report.
```

---

# END OF V2 ADDENDUM
