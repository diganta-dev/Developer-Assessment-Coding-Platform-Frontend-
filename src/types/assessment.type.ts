export interface IProctoringSettings {
  trackTabSwitches: boolean;
  maxTabSwitches: number;
  requireFullscreen: boolean;
  blockCopyPaste: boolean;
  trackFocusLoss: boolean;
}

export interface ICreateAssessmentPayload {
  title: string;
  description: string;
  totalMarks: number;
  passMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  allowedAttempts: number;
  isStrictTimeLimit: boolean;
  proctoringSettings: IProctoringSettings;
}