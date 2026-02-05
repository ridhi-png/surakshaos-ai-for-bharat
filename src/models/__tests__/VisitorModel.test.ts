import { VisitorModel } from '../VisitorModel';
import { VisitorData } from '@/types';

describe('VisitorModel', () => {
  const sampleVisitorData: VisitorData = {
    name: 'John Doe',
    phone_number: '+919876543210',
    purpose: 'Personal Visit',
    intended_resident: 'A-101',
    vehicle_number: 'MH12AB1234'
  };

  describe('constructor', () => {
    it('should create a visitor with required fields', () => {
      const visitor = new VisitorModel(sampleVisitorData);

      expect(visitor.name).toBe(sampleVisitorData.name);
      expect(visitor.phone_number).toBe(sampleVisitorData.phone_number);
      expect(visitor.purpose).toBe(sampleVisitorData.purpose);
      expect(visitor.intended_resident).toBe(sampleVisitorData.intended_resident);
      expect(visitor.approval_status).toBe('PENDING');
      expect(visitor.risk_score).toBe(0);
      expect(visitor.flagged).toBe(false);
      expect(visitor.sync_status).toBe('LOCAL');
    });

    it('should generate a unique ID if not provided', () => {
      const visitor1 = new VisitorModel(sampleVisitorData);
      const visitor2 = new VisitorModel(sampleVisitorData);

      expect(visitor1.id).toBeDefined();
      expect(visitor2.id).toBeDefined();
      expect(visitor1.id).not.toBe(visitor2.id);
    });
  });

  describe('approve', () => {
    it('should approve visitor and set approval details', () => {
      const visitor = new VisitorModel(sampleVisitorData);
      const approvedBy = 'resident123';

      visitor.approve(approvedBy);

      expect(visitor.approval_status).toBe('APPROVED');
      expect(visitor.approved_by).toBe(approvedBy);
      expect(visitor.approval_time).toBeInstanceOf(Date);
    });
  });

  describe('deny', () => {
    it('should deny visitor with reason', () => {
      const visitor = new VisitorModel(sampleVisitorData);
      const reason = 'Resident not available';

      visitor.deny(reason);

      expect(visitor.approval_status).toBe('DENIED');
      expect(visitor.denial_reason).toBe(reason);
      expect(visitor.approval_time).toBeInstanceOf(Date);
    });
  });

  describe('updateRiskScore', () => {
    it('should update risk score and flag status', () => {
      const visitor = new VisitorModel(sampleVisitorData);

      visitor.updateRiskScore(75);

      expect(visitor.risk_score).toBe(75);
      expect(visitor.flagged).toBe(true); // Should be flagged for score >= 60
    });

    it('should not flag for low risk scores', () => {
      const visitor = new VisitorModel(sampleVisitorData);

      visitor.updateRiskScore(30);

      expect(visitor.risk_score).toBe(30);
      expect(visitor.flagged).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const visitor = new VisitorModel(sampleVisitorData);
      const json = visitor.toJSON();

      expect(json.name).toBe(visitor.name);
      expect(json.phone_number).toBe(visitor.phone_number);
      expect(json.approval_status).toBe(visitor.approval_status);
      expect(typeof json.created_at).toBe('string');
    });

    it('should deserialize from JSON correctly', () => {
      const visitor = new VisitorModel(sampleVisitorData);
      const json = visitor.toJSON();
      const deserialized = VisitorModel.fromJSON(json);

      expect(deserialized.name).toBe(visitor.name);
      expect(deserialized.phone_number).toBe(visitor.phone_number);
      expect(deserialized.approval_status).toBe(visitor.approval_status);
      expect(deserialized.created_at).toEqual(visitor.created_at);
    });
  });
});