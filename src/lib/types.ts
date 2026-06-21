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

export interface Job {
  id: string;
  customer: string;
  customerPhone: string;
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

export interface Vehicle {
  id: string;
  name: string;
  type: "Box Truck" | "Cargo Van" | "Tractor Trailer" | "Sprinter Van";
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
