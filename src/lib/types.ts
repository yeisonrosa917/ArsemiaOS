export type JobStatus =
  | "Unassigned"
  | "Assigned"
  | "En Route"
  | "Pickup Started"
  | "Pickup Completed"
  | "Delivery Started"
  | "Completed"
  | "Cancelled";

export type JobType =
  | "Local Move"
  | "Long Distance"
  | "Hourly"
  | "Packing Only"
  | "Loading/Unloading"
  | "Delivery"
  | "Storage In"
  | "Storage Out"
  | "Pickup"
  | "Commercial";

export type DriverStatus =
  | "Available"
  | "On Job"
  | "En Route"
  | "Break"
  | "Offline";

export type PayrollStatus = "Pending" | "Approved" | "Paid" | "Flagged";

export type ClaimStatus =
  | "New"
  | "Under Review"
  | "Customer Contacted"
  | "Approved"
  | "Denied"
  | "Closed";

export type VehicleStatus =
  | "Active"
  | "Idle"
  | "Maintenance"
  | "Out of Service";

export type DocumentKind =
  | "start-job-local"
  | "start-job-hourly"
  | "end-job-hourly"
  | "start-job-long-distance"
  | "start-job-storage-move-in"
  | "pickup-completed"
  | "delivery-completed"
  | "bulky-items-pickup"
  | "bulky-items-delivery"
  | "co-job"
  | "box-bin-details"
  | "feedback";

export interface JobDocument {
  id: string;
  kind: DocumentKind;
  signedAt?: string;
  signedBy?: string;
  signatureImage?: string;
}

export type BedroomCount =
  | "Studio"
  | "1BR"
  | "2BR"
  | "3BR"
  | "4BR"
  | "5BR+";

export type PropertyType =
  | "Apartment"
  | "Condo"
  | "House"
  | "Townhouse"
  | "Commercial"
  | "Storage Unit";

export interface BuildingDetails {
  type: PropertyType;
  bedrooms?: BedroomCount;
  floor?: number;
  hasElevator?: boolean;
  stairsFlights?: number;
  isStrict?: boolean;
  coiRequired?: boolean;
  coiSubmitted?: boolean;
  parkingNotes?: string;
  longCarryFeet?: number;
  notes?: string;
}

export interface JobInventoryItem {
  name: string;
  qty: number;
  cuft: number;
  packByCrew?: boolean;
}

export interface JobAdditionalService {
  id: string;
  name: string;
  price: number;
}

export interface JobConfirmations {
  customerConfirmed: boolean;
  customerConfirmedAt?: string;
  foremanAccepted: boolean;
  foremanAcceptedAt?: string;
  coiSubmitted?: boolean;
  coiSubmittedAt?: string;
}

export interface JobAdjustment {
  id: string;
  amount: number;
  reason: string;
  appliedBy: string;
  appliedAt: string;
}

export interface Job {
  id: string;
  /** Foreign key to Customer. Preferred over substring matching on customer name. */
  customerId?: string;
  customer: string;
  customerPhone: string;
  /** Pre-adjustment baseline used by Payroll Audit and adjustment "before" snapshots. */
  baselineCuFt?: number;
  baselinePrice?: number;
  /** Internal commissionable base used by Payroll Audit. */
  commissionableBase?: number;
  pickup: string;
  delivery: string;
  pickupCity: string;
  deliveryCity: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  type: JobType;
  cuFt: number;
  miles: number;
  hours?: number;
  hourlyRate?: number;
  status: JobStatus;
  driverId?: string;
  driverName?: string;
  crew: string[];
  price: number;
  payrollStatus: PayrollStatus;
  scheduledAt: string;
  eta?: string;
  zone: string;
  priority: "Low" | "Medium" | "High";
  notes?: string;
  isCoJob?: boolean;
  coJobPartnerJobId?: string;
  documents?: JobDocument[];
  bedrooms?: BedroomCount;
  pickupBuilding?: BuildingDetails;
  deliveryBuilding?: BuildingDetails;
  inventoryItems?: JobInventoryItem[];
  additionalServices?: JobAdditionalService[];
  packingByCrew?: boolean;
  confirmations?: JobConfirmations;
  adjustments?: JobAdjustment[];
  /** Cross-module links (set when a job is created from a lead/quote). */
  leadId?: string;
  quoteId?: string;
  /** Truck assigned by dispatch for this job's day (Sprint 2.2). */
  truckId?: string;
  /** Foreman confirmation workflow state (local/in-app only — no real delivery). */
  assignment?: JobAssignment;
}

export type AssignmentStatus =
  | "Draft"
  | "Notified"
  | "Confirmed"
  | "Declined"
  | "Needs Attention";

export interface JobAssignment {
  status: AssignmentStatus;
  notifiedAt?: string;
  confirmedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  /** Who performed the last transition (dispatcher or the foreman). */
  by?: string;
  /**
   * Where a Confirmed came from: the foreman via the portal, or the
   * dispatcher confirming on the foreman's behalf. They are not the same.
   */
  source?: "dispatcher" | "foreman";
  /**
   * Set when the assignment changed after it was sent/confirmed
   * (status becomes "Needs Attention" until the update is re-sent).
   */
  changeNote?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId: string;
  vehicleName: string;
  status: DriverStatus;
  jobsCompleted: number;
  revenueHandled: number;
  rating: number;
  currentLocation: string;
  currentLat?: number;
  currentLng?: number;
  currentJobId?: string;
  eta?: string;
  documentsOk: boolean;
  documentExpiry: string;
  avatarColor: string;
}

export interface PayrollLine {
  jobId: string;
  customer: string;
  cuFt: number;
  miles: number;
  cuFtCharge: number;
  mileageCharge: number;
  mileageRate: 3 | 4;
  extras: number;
  adminSurcharge: number;
  tolls: number;
  commissionableTotal: number;
  crewPercent: number;
  foremanPayout: number;
  helperPayout: number;
  deductions: number;
  finalPayout: number;
  auditFlags: string[];
  status: PayrollStatus;
}

export interface Claim {
  id: string;
  jobId: string;
  customer: string;
  damageType:
    | "Furniture Damage"
    | "Lost Item"
    | "Property Damage"
    | "Late Delivery"
    | "Billing Dispute";
  status: ClaimStatus;
  evidenceCount: number;
  assignedManager: string;
  amountAtRisk: number;
  notes: string;
  openedAt: string;
}

export type VehicleType =
  | "ISUZU NPR 20'"
  | "ISUZU NPR 26'"
  | "Freightliner M2 26'"
  | "Mercedes Sprinter 170"
  | "Mercedes Sprinter 144"
  | "Ford Transit 250"
  | "Cargo Van"
  | "Box Truck";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  vin: string;
  plate: string;
  status: VehicleStatus;
  mileage: number;
  nextMaintenance: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  currentDriver?: string;
  gpsActive: boolean;
  location: string;
}

/** Alias — moving forward, prefer Foreman over Driver. */
export type Foreman = Driver;
export type ForemanStatus = DriverStatus;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalJobs: number;
  lifetimeValue: number;
  lastJobDate: string;
  segment: "Residential" | "Commercial" | "Repeat";
  status: "Active" | "Lead" | "Inactive";
}

/* ─────────────────────────────────────────────────────────────
 * Sales Pipeline — distinct from operational job statuses.
 * ────────────────────────────────────────────────────────── */

export type SalesStage =
  | "New Lead"
  | "Contacted"
  | "Quote Requested"
  | "Quote Drafted"
  | "Quote Sent"
  | "Follow-Up Needed"
  | "Booked"
  | "Converted to Job"
  | "Lost"
  | "Cancelled";

export interface SalesOpportunity {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  source: "Website" | "Yelp" | "Google Ads" | "Referral" | "Phone" | "Walk-in";
  fromCity: string;
  toCity: string;
  estimatedCuFt?: number;
  estimatedValue: number;
  stage: SalesStage;
  assignedSeller?: string;
  createdAt: string;
  lastTouchAt?: string;
  notes?: string;
  quoteId?: string;
  jobId?: string;
}

/* ─────────────────────────────────────────────────────────────
 * Activity Log — structured cross-module entries.
 * ────────────────────────────────────────────────────────── */

export type ActivityModule =
  | "Jobs"
  | "Adjustments"
  | "Quotes"
  | "Leads"
  | "Customers"
  | "Foremen"
  | "Fleet"
  | "Payroll"
  | "Expenses"
  | "Invoices"
  | "Claims"
  | "Settings"
  | "Permissions"
  | "Account"
  | "Privacy"
  | "Dispatch";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "edited"
  | "assigned"
  | "reassigned"
  | "status_changed"
  | "approved"
  | "rejected"
  | "paid"
  | "submitted"
  | "exported"
  | "viewed"
  | "role_switched"
  | "permission_changed"
  | "account_deletion_requested"
  | "account_deletion_completed"
  | "settings_changed"
  | "login";

/** Where a unified event originated (Sprint 3 event foundation). */
export type EventSource = "owner_web" | "foreman_portal" | "system";

/**
 * What a unified event is linked to. "job" and "truck" are emitted today;
 * the rest are reserved for future modules (do NOT emit them before those
 * modules exist).
 */
export type EventLinkedType =
  | "job"
  | "truck"
  | "user"
  | "assignment"
  | "document"
  | "ticket"
  | "claim"
  | "invoice";

export interface ActivityEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  module: ActivityModule;
  action: ActivityAction;
  objectType: string;
  objectId: string;
  title: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  notes?: string;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  /**
   * Sprint 3 unified-event fields. Older persisted entries lack them —
   * readers must treat them as optional and fall back to module/action/
   * objectId.
   */
  eventType?: string;
  source?: EventSource;
  linkedType?: EventLinkedType;
  linkedId?: string;
}

/* ─────────────────────────────────────────────────────────────
 * Account / Privacy — soft-delete schema.
 * ────────────────────────────────────────────────────────── */

export interface AccountState {
  userId: string;
  deletionRequestedAt?: string;
  deletionCompletedAt?: string;
  deletedAt?: string;
  /** When anonymized, original PII is gone and identity becomes "Deleted Account". */
  anonymized: boolean;
}

export interface Invoice {
  id: string;
  jobId: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Void";
}

export interface Route {
  id: string;
  name: string;
  driverId: string;
  driverName: string;
  stops: number;
  miles: number;
  durationHours: number;
  zone: string;
  status: "Planned" | "Active" | "Completed";
  date: string;
}
