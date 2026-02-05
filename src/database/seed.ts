#!/usr/bin/env ts-node

import { DatabaseManager } from './DatabaseManager';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');
    
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();

    // Seed domestic staff data
    await seedDomesticStaff(dbManager);
    
    // Seed sample visitor data
    await seedSampleVisitors(dbManager);
    
    logger.info('Database seeding completed successfully');
    await dbManager.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

async function seedDomesticStaff(dbManager: DatabaseManager): Promise<void> {
  const staffData = [
    {
      id: uuidv4(),
      name: 'Priya Sharma',
      phone_number: '+919876543210',
      address: 'Local Area, City',
      emergency_contact: '+919876543211',
      service_type: 'MAID',
      authorized_units: JSON.stringify(['A-101', 'A-102', 'A-103']),
      work_schedule: JSON.stringify({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '13:00' }
      }),
      access_code: 'MAID001',
      start_date: '2024-01-01',
      active: true
    },
    {
      id: uuidv4(),
      name: 'Ravi Kumar',
      phone_number: '+919876543220',
      address: 'Local Area, City',
      emergency_contact: '+919876543221',
      service_type: 'SECURITY',
      authorized_units: JSON.stringify(['ALL']),
      work_schedule: JSON.stringify({
        monday: { start: '18:00', end: '06:00' },
        tuesday: { start: '18:00', end: '06:00' },
        wednesday: { start: '18:00', end: '06:00' },
        thursday: { start: '18:00', end: '06:00' },
        friday: { start: '18:00', end: '06:00' },
        saturday: { start: '18:00', end: '06:00' },
        sunday: { start: '18:00', end: '06:00' }
      }),
      access_code: 'SEC001',
      start_date: '2024-01-01',
      active: true
    }
  ];

  for (const staff of staffData) {
    await dbManager.run(`
      INSERT OR IGNORE INTO domestic_staff (
        id, name, phone_number, address, emergency_contact, service_type,
        authorized_units, work_schedule, access_code, start_date, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      staff.id, staff.name, staff.phone_number, staff.address, staff.emergency_contact,
      staff.service_type, staff.authorized_units, staff.work_schedule, staff.access_code,
      staff.start_date, staff.active
    ]);
  }

  logger.info(`Seeded ${staffData.length} domestic staff records`);
}

async function seedSampleVisitors(dbManager: DatabaseManager): Promise<void> {
  const visitorData = [
    {
      id: uuidv4(),
      name: 'Amit Patel',
      phone_number: '+919876543230',
      purpose: 'Personal Visit',
      intended_resident: 'A-101',
      approval_status: 'APPROVED',
      risk_score: 15.5,
      flagged: false
    },
    {
      id: uuidv4(),
      name: 'Sunita Devi',
      phone_number: '+919876543240',
      purpose: 'Delivery',
      intended_resident: 'B-205',
      approval_status: 'PENDING',
      risk_score: 25.0,
      flagged: false
    }
  ];

  for (const visitor of visitorData) {
    await dbManager.run(`
      INSERT OR IGNORE INTO visitors (
        id, name, phone_number, purpose, intended_resident,
        approval_status, risk_score, flagged
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      visitor.id, visitor.name, visitor.phone_number, visitor.purpose,
      visitor.intended_resident, visitor.approval_status, visitor.risk_score, visitor.flagged
    ]);
  }

  logger.info(`Seeded ${visitorData.length} sample visitor records`);
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}