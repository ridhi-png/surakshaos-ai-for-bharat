import { VisitorEntry, VisitorData, ApprovalStatus, SyncStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class VisitorModel implements VisitorEntry {
  public id: string;
  public name: string;
  public phone_number: string;
  public purpose: string;
  public intended_resident: string;
  public vehicle_number?: string;
  public entry_time?: Date;
  public exit_time?: Date;
  public approval_status: ApprovalStatus;
  public approved_by?: string;
  public approval_time?: Date;
  public denial_reason?: string;
  public risk_score: number;
  public flagged: boolean;
  public sync_status: SyncStatus;
  public created_at: Date;
  public updated_at: Date;

  constructor(data: VisitorData & Partial<VisitorEntry>) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.phone_number = data.phone_number;
    this.purpose = data.purpose;
    this.intended_resident = data.intended_resident;
    this.vehicle_number = data.vehicle_number;
    this.entry_time = data.entry_time;
    this.exit_time = data.exit_time;
    this.approval_status = data.approval_status || 'PENDING';
    this.approved_by = data.approved_by;
    this.approval_time = data.approval_time;
    this.denial_reason = data.denial_reason;
    this.risk_score = data.risk_score || 0;
    this.flagged = data.flagged || false;
    this.sync_status = data.sync_status || 'LOCAL';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  public approve(approvedBy: string): void {
    this.approval_status = 'APPROVED';
    this.approved_by = approvedBy;
    this.approval_time = new Date();
    this.updated_at = new Date();
  }

  public deny(reason: string): void {
    this.approval_status = 'DENIED';
    this.denial_reason = reason;
    this.approval_time = new Date();
    this.updated_at = new Date();
  }

  public markEntry(): void {
    this.entry_time = new Date();
    this.updated_at = new Date();
  }

  public markExit(): void {
    this.exit_time = new Date();
    this.updated_at = new Date();
  }

  public updateRiskScore(score: number): void {
    this.risk_score = score;
    this.flagged = score >= 60; // Flag if risk score is medium or higher
    this.updated_at = new Date();
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      phone_number: this.phone_number,
      purpose: this.purpose,
      intended_resident: this.intended_resident,
      vehicle_number: this.vehicle_number,
      entry_time: this.entry_time?.toISOString(),
      exit_time: this.exit_time?.toISOString(),
      approval_status: this.approval_status,
      approved_by: this.approved_by,
      approval_time: this.approval_time?.toISOString(),
      denial_reason: this.denial_reason,
      risk_score: this.risk_score,
      flagged: this.flagged,
      sync_status: this.sync_status,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };
  }

  public static fromJSON(json: Record<string, any>): VisitorModel {
    return new VisitorModel({
      id: json.id,
      name: json.name,
      phone_number: json.phone_number,
      purpose: json.purpose,
      intended_resident: json.intended_resident,
      vehicle_number: json.vehicle_number,
      entry_time: json.entry_time ? new Date(json.entry_time) : undefined,
      exit_time: json.exit_time ? new Date(json.exit_time) : undefined,
      approval_status: json.approval_status,
      approved_by: json.approved_by,
      approval_time: json.approval_time ? new Date(json.approval_time) : undefined,
      denial_reason: json.denial_reason,
      risk_score: json.risk_score,
      flagged: json.flagged,
      sync_status: json.sync_status,
      created_at: json.created_at ? new Date(json.created_at) : new Date(),
      updated_at: json.updated_at ? new Date(json.updated_at) : new Date()
    });
  }
}