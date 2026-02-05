import sqlite3 from 'sqlite3';
import { logger } from '@/utils/logger';
import path from 'path';
import fs from 'fs/promises';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: sqlite3.Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/suraksha.db';
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      if (this.dbPath !== ':memory:') {
        const dir = path.dirname(this.dbPath);
        await fs.mkdir(dir, { recursive: true });
      }

      // Initialize database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Error opening database:', err);
          throw err;
        }
        logger.info(`Connected to SQLite database at ${this.dbPath}`);
      });

      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');
      
      // Enable WAL mode for better concurrency
      if (this.dbPath !== ':memory:') {
        await this.run('PRAGMA journal_mode = WAL');
      }

      // Run migrations
      await this.runMigrations();
      
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err);
            reject(err);
          } else {
            logger.info('Database connection closed');
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error:', err);
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async beginTransaction(): Promise<void> {
    await this.run('BEGIN TRANSACTION');
  }

  public async commit(): Promise<void> {
    await this.run('COMMIT');
  }

  public async rollback(): Promise<void> {
    await this.run('ROLLBACK');
  }

  private async runMigrations(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await this.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get list of executed migrations
      const executedMigrations = await this.all<{ name: string }>('SELECT name FROM migrations');
      const executedNames = new Set(executedMigrations.map(m => m.name));

      // Define migrations in order
      const migrations = [
        { name: '001_create_visitors_table', sql: this.getVisitorsTableSQL() },
        { name: '002_create_domestic_staff_table', sql: this.getDomesticStaffTableSQL() },
        { name: '003_create_risk_assessments_table', sql: this.getRiskAssessmentsTableSQL() },
        { name: '004_create_delivery_personnel_table', sql: this.getDeliveryPersonnelTableSQL() },
        { name: '005_create_emergency_logs_table', sql: this.getEmergencyLogsTableSQL() },
        { name: '006_create_audit_logs_table', sql: this.getAuditLogsTableSQL() },
        { name: '007_create_indexes', sql: this.getIndexesSQL() }
      ];

      // Execute pending migrations
      for (const migration of migrations) {
        if (!executedNames.has(migration.name)) {
          logger.info(`Running migration: ${migration.name}`);
          await this.beginTransaction();
          try {
            await this.run(migration.sql);
            await this.run('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
            await this.commit();
            logger.info(`Migration completed: ${migration.name}`);
          } catch (error) {
            await this.rollback();
            throw error;
          }
        }
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  private getVisitorsTableSQL(): string {
    return `
      CREATE TABLE visitors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        purpose TEXT NOT NULL,
        intended_resident TEXT NOT NULL,
        vehicle_number TEXT,
        entry_time DATETIME,
        exit_time DATETIME,
        approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'DENIED')),
        approved_by TEXT,
        approval_time DATETIME,
        denial_reason TEXT,
        risk_score REAL DEFAULT 0,
        flagged BOOLEAN DEFAULT FALSE,
        sync_status TEXT DEFAULT 'LOCAL' CHECK (sync_status IN ('LOCAL', 'SYNCED', 'CONFLICT')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  private getDomesticStaffTableSQL(): string {
    return `
      CREATE TABLE domestic_staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        address TEXT,
        emergency_contact TEXT,
        service_type TEXT NOT NULL CHECK (service_type IN ('MAID', 'COOK', 'DRIVER', 'GARDENER', 'SECURITY', 'OTHER')),
        authorized_units TEXT, -- JSON array of unit numbers
        work_schedule TEXT, -- JSON object with schedule details
        access_code TEXT UNIQUE,
        biometric_id TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        active BOOLEAN DEFAULT TRUE,
        last_entry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  private getRiskAssessmentsTableSQL(): string {
    return `
      CREATE TABLE risk_assessments (
        id TEXT PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        assessment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        risk_score REAL NOT NULL,
        risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        frequency_score REAL DEFAULT 0,
        timing_score REAL DEFAULT 0,
        behavior_score REAL DEFAULT 0,
        historical_score REAL DEFAULT 0,
        anomalies TEXT, -- JSON array of detected anomalies
        explanation TEXT, -- JSON object with explanation details
        confidence REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
      )
    `;
  }

  private getDeliveryPersonnelTableSQL(): string {
    return `
      CREATE TABLE delivery_personnel (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        company_name TEXT NOT NULL,
        delivery_type TEXT NOT NULL,
        recipient_unit TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        expected_delivery_time DATETIME,
        actual_delivery_time DATETIME,
        access_code TEXT,
        access_granted_at DATETIME,
        access_expires_at DATETIME,
        delivery_status TEXT DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  private getEmergencyLogsTableSQL(): string {
    return `
      CREATE TABLE emergency_logs (
        id TEXT PRIMARY KEY,
        emergency_type TEXT NOT NULL,
        activated_by TEXT NOT NULL,
        activation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        deactivation_time DATETIME,
        deactivated_by TEXT,
        override_reason TEXT,
        affected_entries TEXT, -- JSON array of visitor/staff entries during emergency
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  private getAuditLogsTableSQL(): string {
    return `
      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL, -- 'visitor', 'staff', 'delivery', 'emergency', 'system'
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'DENY', etc.
        performed_by TEXT NOT NULL,
        old_values TEXT, -- JSON object with previous values
        new_values TEXT, -- JSON object with new values
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  private getIndexesSQL(): string {
    return `
      -- Visitors table indexes
      CREATE INDEX IF NOT EXISTS idx_visitors_phone ON visitors(phone_number);
      CREATE INDEX IF NOT EXISTS idx_visitors_resident ON visitors(intended_resident);
      CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(approval_status);
      CREATE INDEX IF NOT EXISTS idx_visitors_entry_time ON visitors(entry_time);
      CREATE INDEX IF NOT EXISTS idx_visitors_risk_score ON visitors(risk_score);
      CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
      
      -- Domestic staff table indexes
      CREATE INDEX IF NOT EXISTS idx_staff_phone ON domestic_staff(phone_number);
      CREATE INDEX IF NOT EXISTS idx_staff_service_type ON domestic_staff(service_type);
      CREATE INDEX IF NOT EXISTS idx_staff_active ON domestic_staff(active);
      CREATE INDEX IF NOT EXISTS idx_staff_access_code ON domestic_staff(access_code);
      
      -- Risk assessments table indexes
      CREATE INDEX IF NOT EXISTS idx_risk_visitor_id ON risk_assessments(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_assessments(risk_level);
      CREATE INDEX IF NOT EXISTS idx_risk_score ON risk_assessments(risk_score);
      CREATE INDEX IF NOT EXISTS idx_risk_assessment_time ON risk_assessments(assessment_time);
      
      -- Delivery personnel table indexes
      CREATE INDEX IF NOT EXISTS idx_delivery_phone ON delivery_personnel(phone_number);
      CREATE INDEX IF NOT EXISTS idx_delivery_company ON delivery_personnel(company_name);
      CREATE INDEX IF NOT EXISTS idx_delivery_recipient ON delivery_personnel(recipient_unit);
      CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_personnel(delivery_status);
      CREATE INDEX IF NOT EXISTS idx_delivery_time ON delivery_personnel(expected_delivery_time);
      
      -- Emergency logs table indexes
      CREATE INDEX IF NOT EXISTS idx_emergency_type ON emergency_logs(emergency_type);
      CREATE INDEX IF NOT EXISTS idx_emergency_activation ON emergency_logs(activation_time);
      CREATE INDEX IF NOT EXISTS idx_emergency_activated_by ON emergency_logs(activated_by);
      
      -- Audit logs table indexes
      CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_logs(performed_by);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    `;
  }
}