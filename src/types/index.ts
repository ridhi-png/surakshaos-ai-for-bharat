// Core data types for SurakshaOS

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED';
export type SyncStatus = 'LOCAL' | 'SYNCED' | 'CONFLICT';
export type ServiceType = 'MAID' | 'COOK' | 'DRIVER' | 'GARDENER' | 'SECURITY' | 'OTHER';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'DENY' | 'OVERRIDE';
export type EntityType = 'visitor' | 'staff' | 'delivery' | 'emergency' | 'system';

// Base interface for all entities
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// Visitor related interfaces
export interface VisitorData {
  name: string;
  phone_number: string;
  purpose: string;
  intended_resident: string;
  vehicle_number?: string;
  expected_duration?: number;
}

export interface VisitorEntry extends BaseEntity {
  name: string;
  phone_number: string;
  purpose: string;
  intended_resident: string;
  vehicle_number?: string;
  entry_time?: Date;
  exit_time?: Date;
  approval_status: ApprovalStatus;
  approved_by?: string;
  approval_time?: Date;
  denial_reason?: string;
  risk_score: number;
  flagged: boolean;
  sync_status: SyncStatus;
}

// Domestic staff interfaces
export interface WorkSchedule {
  [day: string]: {
    start: string;
    end: string;
  };
}

export interface DomesticStaffProfile extends BaseEntity {
  name: string;
  phone_number: string;
  address?: string;
  emergency_contact?: string;
  service_type: ServiceType;
  authorized_units: string[]; // Array of unit numbers
  work_schedule: WorkSchedule;
  access_code: string;
  biometric_id?: string;
  start_date: Date;
  end_date?: Date;
  active: boolean;
  last_entry?: Date;
}

// Risk assessment interfaces
export interface RiskFactors {
  frequency_score: number;
  timing_score: number;
  behavior_score: number;
  historical_score: number;
}

export interface AnomalyDetection {
  type: string;
  severity: RiskLevel;
  description: string;
  confidence: number;
}

export interface ExplanationResult {
  primary_reasons: string[];
  recommendations: string[];
  confidence: number;
}

export interface RiskAssessment extends BaseEntity {
  visitor_id: string;
  assessment_time: Date;
  risk_score: number;
  risk_level: RiskLevel;
  frequency_score: number;
  timing_score: number;
  behavior_score: number;
  historical_score: number;
  anomalies: AnomalyDetection[];
  explanation: ExplanationResult;
  confidence: number;
}

// Delivery personnel interfaces
export interface DeliveryPersonnel extends BaseEntity {
  name: string;
  phone_number: string;
  company_name: string;
  delivery_type: string;
  recipient_unit: string;
  recipient_name: string;
  expected_delivery_time?: Date;
  actual_delivery_time?: Date;
  access_code?: string;
  access_granted_at?: Date;
  access_expires_at?: Date;
  delivery_status: DeliveryStatus;
  notes?: string;
}

// Emergency log interfaces
export interface EmergencyLog extends BaseEntity {
  emergency_type: string;
  activated_by: string;
  activation_time: Date;
  deactivation_time?: Date;
  deactivated_by?: string;
  override_reason?: string;
  affected_entries: string[]; // Array of entry IDs affected during emergency
  notes?: string;
}

// Audit log interfaces
export interface AuditLog extends BaseEntity {
  entity_type: EntityType;
  entity_id: string;
  action: AuditAction;
  performed_by: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter interfaces
export interface VisitorFilters {
  name?: string;
  phone_number?: string;
  intended_resident?: string;
  approval_status?: ApprovalStatus;
  date_from?: Date;
  date_to?: Date;
  risk_level?: RiskLevel;
  flagged?: boolean;
  page?: number;
  limit?: number;
}

export interface StaffFilters {
  name?: string;
  service_type?: ServiceType;
  active?: boolean;
  authorized_unit?: string;
  page?: number;
  limit?: number;
}

// Validation result interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Communication interfaces
export interface NotificationData {
  recipient: string;
  message: string;
  template?: string;
  params?: Record<string, any>;
}

export interface CommunicationResult {
  success: boolean;
  message_id?: string;
  error?: string;
}