# ARSEMIAOS — Organization, Roles, Tickets & Communications Spec

**Version:** 0.1  
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

