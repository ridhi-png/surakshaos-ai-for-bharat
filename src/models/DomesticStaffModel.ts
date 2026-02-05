import { DomesticStaffProfile, ServiceType, WorkSchedule } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class DomesticStaffModel implements DomesticStaffProfile {
  public id: string;
  public name: string;
  public phone_number: string;
  public address?: string;
  public emergency_contact?: string;
  public service_type: ServiceType;
  public authorized_units: string[];
  public work_schedule: WorkSchedule;
  public access_code: string;
  public biometric_id?: string;
  public start_date: Date;
  public end_date?: Date;
  public active: boolean;
  public last_entry?: Date;
  public created_at: Date;
  public updated_at: Date;

  constructor(data: Partial<DomesticStaffProfile> & {
    name: string;
    phone_number: string;
    service_type: ServiceType;
    authorized_units: string[];
    work_schedule: WorkSchedule;
    access_code: string;
    start_date: Date;
  }) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.phone_number = data.phone_number;
    this.address = data.address;
    this.emergency_contact = data.emergency_contact;
    this.service_type = data.service_type;
    this.authorized_units = data.authorized_units;
    this.work_schedule = data.work_schedule;
    this.access_code = data.access_code;
    this.biometric_id = data.biometric_id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.active = data.active !== undefined ? data.active : true;
    this.last_entry = data.last_entry;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  public isAuthorizedForUnit(unitNumber: string): boolean {
    return this.authorized_units.includes('ALL') || this.authorized_units.includes(unitNumber);
  }

  public isWorkingNow(): boolean {
    const now = new Date();
    const dayName = now.toLocaleLowerCase().substring(0, 3); // 'mon', 'tue', etc.
    const currentTime = now.toTimeString().substring(0, 5); // 'HH:MM'

    const todaySchedule = this.work_schedule[dayName];
    if (!todaySchedule) {
      return false;
    }

    return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
  }

  public recordEntry(): void {
    this.last_entry = new Date();
    this.updated_at = new Date();
  }

  public deactivate(endDate?: Date): void {
    this.active = false;
    this.end_date = endDate || new Date();
    this.updated_at = new Date();
  }

  public reactivate(): void {
    this.active = true;
    this.end_date = undefined;
    this.updated_at = new Date();
  }

  public updateSchedule(newSchedule: WorkSchedule): void {
    this.work_schedule = newSchedule;
    this.updated_at = new Date();
  }

  public addAuthorizedUnit(unitNumber: string): void {
    if (!this.authorized_units.includes(unitNumber)) {
      this.authorized_units.push(unitNumber);
      this.updated_at = new Date();
    }
  }

  public removeAuthorizedUnit(unitNumber: string): void {
    const index = this.authorized_units.indexOf(unitNumber);
    if (index > -1) {
      this.authorized_units.splice(index, 1);
      this.updated_at = new Date();
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      phone_number: this.phone_number,
      address: this.address,
      emergency_contact: this.emergency_contact,
      service_type: this.service_type,
      authorized_units: this.authorized_units,
      work_schedule: this.work_schedule,
      access_code: this.access_code,
      biometric_id: this.biometric_id,
      start_date: this.start_date.toISOString(),
      end_date: this.end_date?.toISOString(),
      active: this.active,
      last_entry: this.last_entry?.toISOString(),
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };
  }

  public static fromJSON(json: Record<string, any>): DomesticStaffModel {
    return new DomesticStaffModel({
      id: json.id,
      name: json.name,
      phone_number: json.phone_number,
      address: json.address,
      emergency_contact: json.emergency_contact,
      service_type: json.service_type,
      authorized_units: json.authorized_units,
      work_schedule: json.work_schedule,
      access_code: json.access_code,
      biometric_id: json.biometric_id,
      start_date: new Date(json.start_date),
      end_date: json.end_date ? new Date(json.end_date) : undefined,
      active: json.active,
      last_entry: json.last_entry ? new Date(json.last_entry) : undefined,
      created_at: json.created_at ? new Date(json.created_at) : new Date(),
      updated_at: json.updated_at ? new Date(json.updated_at) : new Date()
    });
  }
}