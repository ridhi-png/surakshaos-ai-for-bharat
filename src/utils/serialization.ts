import { logger } from './logger';

/**
 * Serialization utilities for converting between different data formats
 * Used for database storage, API responses, and data synchronization
 */

// JSON serialization with error handling
export function safeJSONStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    logger.error('JSON stringify error:', error);
    return '{}';
  }
}

export function safeJSONParse<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.error('JSON parse error:', error);
    return null;
  }
}

// Date serialization utilities
export function serializeDate(date: Date | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

export function deserializeDate(dateString: string | null): Date | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}

// Array serialization for database storage
export function serializeArray(array: any[]): string {
  return safeJSONStringify(array);
}

export function deserializeArray<T = any>(arrayString: string): T[] {
  const parsed = safeJSONParse<T[]>(arrayString);
  return Array.isArray(parsed) ? parsed : [];
}

// Object serialization for complex data structures
export function serializeObject(obj: Record<string, any>): string {
  return safeJSONStringify(obj);
}

export function deserializeObject<T = Record<string, any>>(objString: string): T {
  const parsed = safeJSONParse<T>(objString);
  return parsed || ({} as T);
}

// Database row transformation utilities
export function transformDatabaseRow(row: any): Record<string, any> {
  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      transformed[key] = null;
      continue;
    }

    // Handle JSON fields
    if (typeof value === 'string' && (key.includes('schedule') || key.includes('units') || key.includes('anomalies') || key.includes('explanation'))) {
      transformed[key] = safeJSONParse(value);
      continue;
    }

    // Handle date fields
    if (key.includes('_at') || key.includes('_time') || key.includes('_date')) {
      transformed[key] = deserializeDate(value as string);
      continue;
    }

    // Handle boolean fields
    if (typeof value === 'number' && (key === 'active' || key === 'flagged')) {
      transformed[key] = Boolean(value);
      continue;
    }

    transformed[key] = value;
  }

  return transformed;
}

// API response serialization
export function serializeApiResponse<T>(data: T, success: boolean = true, message?: string): string {
  const response = {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  return safeJSONStringify(response);
}

export function serializeErrorResponse(error: string, code?: string): string {
  const response = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  };

  return safeJSONStringify(response);
}

// Pagination serialization
export function serializePaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): string {
  const response = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  };

  return safeJSONStringify(response);
}

// Data export utilities
export function serializeForExport(data: any[], format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    return convertToCSV(data);
  }
  return safeJSONStringify(data);
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return `"${safeJSONStringify(value).replace(/"/g, '""')}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Data import utilities
export function deserializeFromImport(data: string, format: 'json' | 'csv' = 'json'): any[] {
  if (format === 'csv') {
    return parseCSV(data);
  }
  const parsed = safeJSONParse<any[]>(data);
  return Array.isArray(parsed) ? parsed : [];
}

function parseCSV(csvData: string): any[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      result.push(row);
    }
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Sync data serialization
export function serializeForSync(data: any): string {
  const syncData = {
    ...data,
    sync_timestamp: new Date().toISOString(),
    sync_version: 1
  };

  return safeJSONStringify(syncData);
}

export function deserializeFromSync(syncData: string): any {
  const parsed = safeJSONParse(syncData);
  if (!parsed) return null;

  // Remove sync metadata
  const { sync_timestamp, sync_version, ...data } = parsed;
  return data;
}

// Encryption-ready serialization (for sensitive data)
export function serializeSecure(data: any): string {
  // In a real implementation, this would include encryption
  // For now, we'll just serialize with a marker
  const secureData = {
    encrypted: false, // Would be true with actual encryption
    data: data,
    timestamp: new Date().toISOString()
  };

  return safeJSONStringify(secureData);
}

export function deserializeSecure(secureData: string): any {
  const parsed = safeJSONParse(secureData);
  if (!parsed || !parsed.data) return null;

  // In a real implementation, this would include decryption
  return parsed.data;
}

// Validation helpers for serialized data
export function isValidSerializedData(data: string): boolean {
  const parsed = safeJSONParse(data);
  return parsed !== null;
}

export function getSerializedDataSize(data: string): number {
  return new Blob([data]).size;
}

// Compression utilities (for large data sets)
export function compressData(data: string): string {
  // Simple compression placeholder - in production, use actual compression library
  return data;
}

export function decompressData(compressedData: string): string {
  // Simple decompression placeholder - in production, use actual compression library
  return compressedData;
}