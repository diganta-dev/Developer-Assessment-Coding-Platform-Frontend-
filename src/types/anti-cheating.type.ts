import type { AntiCheatEventType } from "./assessment.type";

export type CheatingRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IAntiCheatEventMetadata {
  durationSeconds?: number;
  count?: number;
  clientTimestamp?: string | number | Date;
  userAgent?: string;
  ipAddress?: string;
  copiedTextLength?: number;
  pastedTextLength?: number;
  textPreview?: string;
  targetElement?: string;
  screenResolution?: string;
  anomalyType?: string;
  details?: string;
  reason?: string;
  flaggedBy?: string;
  severity?: string;
  [key: string]: unknown;
}

export interface ITabSwitchPayload {
  durationSeconds?: number;
  count?: number;
  clientTimestamp?: string | number | Date;
  userAgent?: string;
}

export interface IMultipleTabPayload {
  activeTabCount?: number;
  sessionToken?: string;
  clientTimestamp?: string | number | Date;
  details?: string;
}

export interface ICopyPastePayload {
  operation: "COPY" | "PASTE";
  textLength?: number;
  textPreview?: string;
  targetElement?: string;
  clientTimestamp?: string | number | Date;
}

export interface IFullscreenExitPayload {
  durationOutsideSeconds?: number;
  screenResolution?: string;
  clientTimestamp?: string | number | Date;
  reason?: string;
}

export interface ISuspiciousActivityPayload {
  anomalyType: string;
  details?: string;
  clientTimestamp?: string | number | Date;
  metadata?: Record<string, unknown>;
}

export interface IRecordViolationPayload {
  type: AntiCheatEventType;
  metadata?: Record<string, unknown>;
  occurredAt?: string | number | Date;
}

export interface IFlagAttemptPayload {
  reason: string;
  severity?: "MEDIUM" | "HIGH" | "CRITICAL";
  disqualify?: boolean;
  notes?: string;
}

export interface IAntiCheatEventItem {
  id: string;
  attemptId: string;
  type: AntiCheatEventType;
  metadata: IAntiCheatEventMetadata | null;
  occurredAt: string | Date;
  policyViolationWarning?: string | null;
}

export interface IAntiCheatEventResponse {
  success: boolean;
  message: string;
  data: IAntiCheatEventItem;
}

export interface ICheatingRiskReport {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  attemptStatus: string;
  riskScore: number;
  riskLevel: CheatingRiskLevel;
  isFlagged: boolean;
  flagReason: string | null;
  disqualified: boolean;
  totalEvents: number;
  eventsByType: Record<AntiCheatEventType, number>;
  timeline: Array<{
    id: string;
    type: AntiCheatEventType;
    occurredAt: string | Date;
    metadata: IAntiCheatEventMetadata | null;
  }>;
  policySettings: {
    preventCopyPaste: boolean;
    requireFullscreen: boolean;
    copyPasteViolationsCount: number;
    fullscreenViolationsCount: number;
  };
  recommendation: string;
}

export interface ICheatingRiskResponse {
  success: boolean;
  message: string;
  data: ICheatingRiskReport;
}

export interface IFlagAttemptResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    isFlagged: boolean;
    status: string;
    reason: string;
    flaggedAt: string | Date;
    flaggedBy: string;
    disqualified: boolean;
    event: IAntiCheatEventItem;
  };
}
