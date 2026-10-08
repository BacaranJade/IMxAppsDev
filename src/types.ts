export type RequestStatus =
  | "Pending" // submitted, waiting for admin approval
  | "Declined" // admin rejected it
  | "Open" // approved
  | "In Progress"
  | "Resolved";

export type RequestPriority = "Low" | "Medium" | "High" | "Urgent";

export type RequestCategory =
  | "Electrical"
  | "Plumbing"
  | "HVAC"
  | "Furniture"
  | "Cleaning"
  | "IT / Technology"
  | "Structural"
  | "Other";

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  location: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestedBy: string;
  dateSubmitted: string; // ISO date
  dateUpdated: string; // ISO date
  /** Data URL (base64) of an uploaded proof photo, if any. */
  photoDataUrl?: string;
  /** Why an admin declined the request (optional). */
  declineReason?: string;
}

export interface NewRequestInput {
  title: string;
  description: string;
  category: RequestCategory;
  location: string;
  priority: RequestPriority;
  photoDataUrl?: string;
}

export type UserRole = "student" | "admin";

export interface AuthUser {
  email: string;
  role: UserRole;
}