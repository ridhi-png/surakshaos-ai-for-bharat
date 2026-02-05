import Joi from 'joi';
import { ValidationResult, ValidationError, VisitorData, ServiceType, WorkSchedule } from '@/types';

// Phone number validation for Indian numbers
const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

// Common validation schemas
const phoneSchema = Joi.string()
  .pattern(indianPhoneRegex)
  .required()
  .messages({
    'string.pattern.base': 'Phone number must be a valid Indian mobile number',
    'any.required': 'Phone number is required'
  });

const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .pattern(/^[a-zA-Z\s.]+$/)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, and dots',
    'any.required': 'Name is required'
  });

const unitNumberSchema = Joi.string()
  .pattern(/^[A-Z]-\d{3}$|^ALL$/)
  .messages({
    'string.pattern.base': 'Unit number must be in format A-101 or ALL'
  });

// Visitor data validation schema
const visitorDataSchema = Joi.object({
  name: nameSchema,
  phone_number: phoneSchema,
  purpose: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Purpose must be at least 3 characters long',
      'string.max': 'Purpose cannot exceed 200 characters',
      'any.required': 'Purpose is required'
    }),
  intended_resident: unitNumberSchema.required().messages({
    'any.required': 'Intended resident unit is required'
  }),
  vehicle_number: Joi.string()
    .pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Vehicle number must be in Indian format (e.g., MH12AB1234)'
    }),
  expected_duration: Joi.number()
    .min(15)
    .max(1440) // 24 hours in minutes
    .optional()
    .messages({
      'number.min': 'Expected duration must be at least 15 minutes',
      'number.max': 'Expected duration cannot exceed 24 hours'
    })
});

// Domestic staff validation schema
const workScheduleSchema = Joi.object().pattern(
  Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  Joi.object({
    start: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:MM format'
      }),
    end: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:MM format'
      })
  })
);

const domesticStaffSchema = Joi.object({
  name: nameSchema,
  phone_number: phoneSchema,
  address: Joi.string()
    .max(300)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 300 characters'
    }),
  emergency_contact: phoneSchema.optional(),
  service_type: Joi.string()
    .valid('MAID', 'COOK', 'DRIVER', 'GARDENER', 'SECURITY', 'OTHER')
    .required()
    .messages({
      'any.only': 'Service type must be one of: MAID, COOK, DRIVER, GARDENER, SECURITY, OTHER',
      'any.required': 'Service type is required'
    }),
  authorized_units: Joi.array()
    .items(unitNumberSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one authorized unit is required',
      'any.required': 'Authorized units are required'
    }),
  work_schedule: workScheduleSchema.required().messages({
    'any.required': 'Work schedule is required'
  }),
  access_code: Joi.string()
    .alphanum()
    .min(4)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Access code can only contain letters and numbers',
      'string.min': 'Access code must be at least 4 characters long',
      'string.max': 'Access code cannot exceed 20 characters',
      'any.required': 'Access code is required'
    }),
  start_date: Joi.date()
    .required()
    .messages({
      'any.required': 'Start date is required'
    }),
  end_date: Joi.date()
    .greater(Joi.ref('start_date'))
    .optional()
    .messages({
      'date.greater': 'End date must be after start date'
    })
});

// Delivery personnel validation schema
const deliveryPersonnelSchema = Joi.object({
  name: nameSchema,
  phone_number: phoneSchema,
  company_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Company name must be at least 2 characters long',
      'string.max': 'Company name cannot exceed 100 characters',
      'any.required': 'Company name is required'
    }),
  delivery_type: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Delivery type must be at least 3 characters long',
      'string.max': 'Delivery type cannot exceed 50 characters',
      'any.required': 'Delivery type is required'
    }),
  recipient_unit: unitNumberSchema.required().messages({
    'any.required': 'Recipient unit is required'
  }),
  recipient_name: nameSchema,
  expected_delivery_time: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Expected delivery time cannot be in the past'
    })
});

// Validation helper functions
export function validateVisitorData(data: any): ValidationResult {
  return validateWithSchema(visitorDataSchema, data);
}

export function validateDomesticStaff(data: any): ValidationResult {
  return validateWithSchema(domesticStaffSchema, data);
}

export function validateDeliveryPersonnel(data: any): ValidationResult {
  return validateWithSchema(deliveryPersonnelSchema, data);
}

export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  const schema = Joi.string().pattern(indianPhoneRegex).required();
  return validateWithSchema(schema, phoneNumber);
}

export function validateUnitNumber(unitNumber: string): ValidationResult {
  return validateWithSchema(unitNumberSchema, unitNumber);
}

export function validateWorkSchedule(schedule: WorkSchedule): ValidationResult {
  return validateWithSchema(workScheduleSchema, schedule);
}

// Generic validation function
function validateWithSchema(schema: Joi.Schema, data: any): ValidationResult {
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (!error) {
    return { isValid: true, errors: [] };
  }

  const errors: ValidationError[] = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    code: detail.type
  }));

  return { isValid: false, errors };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters and add +91 prefix if needed
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits.substring(1)}`;
  }
  
  return phoneNumber; // Return original if format is unclear
}

export function sanitizeUnitNumber(unitNumber: string): string {
  return unitNumber.toUpperCase().trim();
}

// Data transformation utilities
export function transformVisitorData(rawData: any): VisitorData {
  return {
    name: sanitizeString(rawData.name),
    phone_number: sanitizePhoneNumber(rawData.phone_number),
    purpose: sanitizeString(rawData.purpose),
    intended_resident: sanitizeUnitNumber(rawData.intended_resident),
    vehicle_number: rawData.vehicle_number ? sanitizeString(rawData.vehicle_number).toUpperCase() : undefined,
    expected_duration: rawData.expected_duration ? parseInt(rawData.expected_duration) : undefined
  };
}

// Risk score validation
export function validateRiskScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100 && !isNaN(score);
}

// Date validation utilities
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

export function isWithinBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour <= 22; // 6 AM to 10 PM
}

// Access code validation
export function generateAccessCode(prefix: string, length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function isValidAccessCode(code: string): boolean {
  return /^[A-Z0-9]{4,20}$/.test(code);
}