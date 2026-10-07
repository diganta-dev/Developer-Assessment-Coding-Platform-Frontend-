import { useMutation, useQuery } from "@tanstack/react-query";
import {
  detectCopyPaste,
  detectFullscreenExit,
  detectMultipleTabs,
  detectSuspiciousActivity,
  detectTabSwitch,
  flagAttempt,
  getCheatingRisk,
  recordAntiCheatViolation,
} from "@/api/anti-cheating.api";
import type {
  ICopyPastePayload,
  IFlagAttemptPayload,
  IFullscreenExitPayload,
  IMultipleTabPayload,
  IRecordViolationPayload,
  ISuspiciousActivityPayload,
  ITabSwitchPayload,
} from "@/types/anti-cheating.type";

/**
 * Pure mutation hook: Record generic anti-cheat violation
 */
export function useRecordViolation() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: IRecordViolationPayload;
    }) => recordAntiCheatViolation(attemptId, payload),
  });
}

/**
 * Pure mutation hook: Log candidate tab switch or visibility loss
 */
export function useDetectTabSwitch() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload?: ITabSwitchPayload;
    }) => detectTabSwitch(attemptId, payload),
  });
}

/**
 * Pure mutation hook: Log multiple concurrent browser tabs
 */
export function useDetectMultipleTabs() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload?: IMultipleTabPayload;
    }) => detectMultipleTabs(attemptId, payload),
  });
}

/**
 * Pure mutation hook: Log clipboard copy or paste anomaly
 */
export function useDetectCopyPaste() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: ICopyPastePayload;
    }) => detectCopyPaste(attemptId, payload),
  });
}

/**
 * Pure mutation hook: Log fullscreen departure
 */
export function useDetectFullscreenExit() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload?: IFullscreenExitPayload;
    }) => detectFullscreenExit(attemptId, payload),
  });
}

/**
 * Pure mutation hook: Log suspicious client anomaly
 */
export function useDetectSuspiciousActivity() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: ISuspiciousActivityPayload;
    }) => detectSuspiciousActivity(attemptId, payload),
  });
}

/**
 * Pure query hook: Calculate & fetch multi-factor cheating risk report
 */
export function useGetCheatingRisk(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: ["cheating-risk", attemptId],
    queryFn: () => getCheatingRisk(attemptId),
    enabled: Boolean(attemptId) && enabled,
    refetchInterval: false,
  });
}

/**
 * Pure mutation hook: Formally flag or disqualify attempt
 */
export function useFlagAttempt() {
  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: IFlagAttemptPayload;
    }) => flagAttempt(attemptId, payload),
  });
}
