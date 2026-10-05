export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// ==========================================
// MCQ Types
// ==========================================
export interface IMCQOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface IMCQQuestionDetails {
  question: string;
  multipleCorrect: boolean;
  options: IMCQOption[];
}

export interface ICreateMCQQuestion {
  title: string;
  description: string;
  type: "MCQ";
  difficulty: Difficulty;
  defaultMarks: number;
  companyId?: string;
  mcqQuestion: IMCQQuestionDetails;
}

// ==========================================
// Written Question Types
// ==========================================
export interface IWrittenQuestionDetails {
  guidelines: string;
  minWords?: number;
  maxWords?: number;
}

export interface ICreateWrittenQuestion {
  title: string;
  description: string;
  type: "WRITTEN";
  difficulty: Difficulty;
  defaultMarks: number;
  companyId?: string;
  writtenQuestion: IWrittenQuestionDetails;
}

// ==========================================
// Union Type for API Payloads
// ==========================================
export type ICreateQuestion = ICreateMCQQuestion | ICreateWrittenQuestion;
