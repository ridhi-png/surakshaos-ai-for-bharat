import { RiskAssessment, RiskLevel, RiskFactors, AnomalyDetection, ExplanationResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class RiskAssessmentModel implements RiskAssessment {
  public id: string;
  public visitor_id: string;
  public assessment_time: Date;
  public risk_score: number;
  public risk_level: RiskLevel;
  public frequency_score: number;
  public timing_score: number;
  public behavior_score: number;
  public historical_score: number;
  public anomalies: AnomalyDetection[];
  public explanation: ExplanationResult;
  public confidence: number;
  public created_at: Date;
  public updated_at: Date;

  constructor(data: Partial<RiskAssessment> & {
    visitor_id: string;
    risk_score: number;
    risk_level: RiskLevel;
    frequency_score: number;
    timing_score: number;
    behavior_score: number;
    historical_score: number;
    anomalies: AnomalyDetection[];
    explanation: ExplanationResult;
    confidence: number;
  }) {
    this.id = data.id || uuidv4();
    this.visitor_id = data.visitor_id;
    this.assessment_time = data.assessment_time || new Date();
    this.risk_score = data.risk_score;
    this.risk_level = data.risk_level;
    this.frequency_score = data.frequency_score;
    this.timing_score = data.timing_score;
    this.behavior_score = data.behavior_score;
    this.historical_score = data.historical_score;
    this.anomalies = data.anomalies;
    this.explanation = data.explanation;
    this.confidence = data.confidence;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  public static calculateRiskLevel(score: number): RiskLevel {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 80) return 'HIGH';
    return 'CRITICAL';
  }

  public static calculateOverallRiskScore(factors: RiskFactors): number {
    // Weighted average of risk factors
    const weights = {
      frequency: 0.3,
      timing: 0.2,
      behavior: 0.3,
      historical: 0.2
    };

    return (
      factors.frequency_score * weights.frequency +
      factors.timing_score * weights.timing +
      factors.behavior_score * weights.behavior +
      factors.historical_score * weights.historical
    );
  }

  public hasHighRiskAnomalies(): boolean {
    return this.anomalies.some(anomaly => 
      anomaly.severity === 'HIGH' || anomaly.severity === 'CRITICAL'
    );
  }

  public getTopAnomalies(limit: number = 3): AnomalyDetection[] {
    return this.anomalies
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  public isHighConfidence(): boolean {
    return this.confidence >= 0.8;
  }

  public shouldTriggerAlert(): boolean {
    return this.risk_level === 'HIGH' || 
           this.risk_level === 'CRITICAL' || 
           this.hasHighRiskAnomalies();
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      visitor_id: this.visitor_id,
      assessment_time: this.assessment_time.toISOString(),
      risk_score: this.risk_score,
      risk_level: this.risk_level,
      frequency_score: this.frequency_score,
      timing_score: this.timing_score,
      behavior_score: this.behavior_score,
      historical_score: this.historical_score,
      anomalies: this.anomalies,
      explanation: this.explanation,
      confidence: this.confidence,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };
  }

  public static fromJSON(json: Record<string, any>): RiskAssessmentModel {
    return new RiskAssessmentModel({
      id: json.id,
      visitor_id: json.visitor_id,
      assessment_time: json.assessment_time ? new Date(json.assessment_time) : new Date(),
      risk_score: json.risk_score,
      risk_level: json.risk_level,
      frequency_score: json.frequency_score,
      timing_score: json.timing_score,
      behavior_score: json.behavior_score,
      historical_score: json.historical_score,
      anomalies: json.anomalies || [],
      explanation: json.explanation || { primary_reasons: [], recommendations: [], confidence: 0 },
      confidence: json.confidence,
      created_at: json.created_at ? new Date(json.created_at) : new Date(),
      updated_at: json.updated_at ? new Date(json.updated_at) : new Date()
    });
  }
}