import { 
  validateVisitorData, 
  validatePhoneNumber, 
  validateUnitNumber,
  sanitizePhoneNumber,
  sanitizeUnitNumber,
  transformVisitorData
} from '../validation';

describe('Validation Utils', () => {
  describe('validateVisitorData', () => {
    const validVisitorData = {
      name: 'John Doe',
      phone_number: '+919876543210',
      purpose: 'Personal Visit',
      intended_resident: 'A-101'
    };

    it('should validate correct visitor data', () => {
      const result = validateVisitorData(validVisitorData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid phone number', () => {
      const invalidData = { ...validVisitorData, phone_number: '123' };
      const result = validateVisitorData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'phone_number')).toBe(true);
    });

    it('should reject invalid unit number', () => {
      const invalidData = { ...validVisitorData, intended_resident: 'invalid' };
      const result = validateVisitorData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'intended_resident')).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = { ...validVisitorData, name: '' };
      const result = validateVisitorData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Indian mobile numbers', () => {
      const validNumbers = ['+919876543210', '919876543210', '9876543210'];
      
      validNumbers.forEach(number => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = ['123', '+1234567890', '5876543210'];
      
      invalidNumbers.forEach(number => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateUnitNumber', () => {
    it('should validate correct unit numbers', () => {
      const validUnits = ['A-101', 'B-205', 'ALL'];
      
      validUnits.forEach(unit => {
        const result = validateUnitNumber(unit);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid unit numbers', () => {
      const invalidUnits = ['A101', 'a-101', '101', 'INVALID'];
      
      invalidUnits.forEach(unit => {
        const result = validateUnitNumber(unit);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should add +91 prefix to 10-digit numbers', () => {
      expect(sanitizePhoneNumber('9876543210')).toBe('+919876543210');
    });

    it('should handle numbers with country code', () => {
      expect(sanitizePhoneNumber('919876543210')).toBe('+919876543210');
      expect(sanitizePhoneNumber('+919876543210')).toBe('+919876543210');
    });

    it('should remove spaces and special characters', () => {
      expect(sanitizePhoneNumber('98765 43210')).toBe('+919876543210');
      expect(sanitizePhoneNumber('(987) 654-3210')).toBe('+919876543210');
    });
  });

  describe('sanitizeUnitNumber', () => {
    it('should convert to uppercase', () => {
      expect(sanitizeUnitNumber('a-101')).toBe('A-101');
      expect(sanitizeUnitNumber('b-205')).toBe('B-205');
    });

    it('should trim whitespace', () => {
      expect(sanitizeUnitNumber(' A-101 ')).toBe('A-101');
    });
  });

  describe('transformVisitorData', () => {
    it('should transform and sanitize visitor data', () => {
      const rawData = {
        name: '  John Doe  ',
        phone_number: '98765 43210',
        purpose: 'Personal   Visit',
        intended_resident: 'a-101',
        vehicle_number: 'mh12ab1234'
      };

      const transformed = transformVisitorData(rawData);

      expect(transformed.name).toBe('John Doe');
      expect(transformed.phone_number).toBe('+919876543210');
      expect(transformed.purpose).toBe('Personal Visit');
      expect(transformed.intended_resident).toBe('A-101');
      expect(transformed.vehicle_number).toBe('MH12AB1234');
    });
  });
});