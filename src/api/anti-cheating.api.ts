import apiClient from "@/lib/apiClient";
import type {
  IAntiCheatEventResponse,
  ICheatingRiskResponse,
  ICopyPastePayload,
  IFlagAttemptPayload,
  IFlagAttemptResponse,
  IFullscreenExitPayload,
  IMultipleTabPayload,
  IRecordViolationPayload,
  ISuspiciousActivityPayload,
  ITabSwitchPayload,
} from "@/types/anti-cheating.type";

/**
 * 1. Record generic anti-cheat violation
 */
export function recordAntiCheatViolation(
  attemptId: string,
  payload: IRecordViolationPayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/violation`, {
    method: "POST",
    body: payload,
  });
}

/**
 * 2. Log tab switch or visibility loss
 */
export function detectTabSwitch(
  attemptId: string,
  payload?: ITabSwitchPayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/tab-switch`, {
    method: "POST",
    body: payload || {},
  });
}

/**
 * 3. Log multiple concurrent tabs / browser sessions
 */
export function detectMultipleTabs(
  attemptId: string,
  payload?: IMultipleTabPayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/multiple-tabs`, {
    method: "POST",
    body: payload || {},
  });
}

/**
 * 4. Log clipboard copy / paste anomaly
 */
export function detectCopyPaste(
  attemptId: string,
  payload: ICopyPastePayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/copy-paste`, {
    method: "POST",
    body: payload,
  });
}

/**
 * 5. Log fullscreen departure
 */
export function detectFullscreenExit(
  attemptId: string,
  payload?: IFullscreenExitPayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/fullscreen-exit`, {
    method: "POST",
    body: payload || {},
  });
}

/**
 * 6. Log suspicious client activity (DevTools, blur, keystroke anomalies)
 */
export function detectSuspiciousActivity(
  attemptId: string,
  payload: ISuspiciousActivityPayload,
): Promise<IAntiCheatEventResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/suspicious-activity`, {
    method: "POST",
    body: payload,
  });
}

/**
 * 7. Retrieve multi-factor cheating risk score & audit trail
 */
export function getCheatingRisk(
  attemptId: string,
): Promise<ICheatingRiskResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/risk`, {
    method: "GET",
  });
}

/**
 * 8. Formally flag or disqualify attempt (Admin/Proctor)
 */
export function flagAttempt(
  attemptId: string,
  payload: IFlagAttemptPayload,
): Promise<IFlagAttemptResponse> {
  return apiClient(`anti-cheating/attempt/${attemptId}/flag`, {
    method: "POST",
    body: payload,
  });
}
