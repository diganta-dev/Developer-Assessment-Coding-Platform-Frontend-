export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ProblemType = "MCQ" | "WRITTEN" | "CODING";
export type SortOrder = "asc" | "desc";

// ==========================================
// Pagination & API Response Types
// ==========================================
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IProblemFilters {
  searchTerm?: string;
  type?: ProblemType;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface IProblemListItem {
  id: string;
  title: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  marks: number;
  defaultMarks?: number;
  companyId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  } | null;
}

export interface IProblemListResponse {
  data: IProblemListItem[];
  meta: IPaginationMeta;
}

// ==========================================
// MCQ Types (aligned with backend schema)
// ==========================================
export interface IMCQOption {
  text?: string;
  optionText?: string;
  isCorrect: boolean;
  explanation?: string;
  optionOrder?: number;
}

export interface ICreateMCQOptionPayload {
  optionText: string;
  isCorrect: boolean;
  optionOrder?: number;
}

export interface ICreateMCQDetailsPayload {
  explanation?: string;
  options: ICreateMCQOptionPayload[];
}

export interface ICreateMCQQuestion {
  title: string;
  description: string;
  type: "MCQ";
  difficulty: Difficulty;
  marks: number;
  companyId?: string;
  mcq: ICreateMCQDetailsPayload;
}

// ==========================================
// Written Question Types (aligned with backend schema)
// ==========================================
export interface ICreateWrittenDetailsPayload {
  wordLimit?: number;
  expectedAnswer?: string;
}

export interface ICreateWrittenQuestion {
  title: string;
  description: string;
  type: "WRITTEN";
  difficulty: Difficulty;
  marks: number;
  companyId?: string;
  written: ICreateWrittenDetailsPayload;
}

// ==========================================
// Coding Question Types (aligned with backend schema)
// ==========================================
export type TestCaseType = "PUBLIC" | "HIDDEN";

export interface ITestCase {
  type: TestCaseType;
  input: string;
  expectedOutput: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface ICodingDetails {
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  starterCode?: Record<string, string>;
  supportedLanguages: string[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
  testCases: ITestCase[];
}

export interface ICreateCodingQuestion {
  title: string;
  description: string;
  type: "CODING";
  difficulty: Difficulty;
  marks: number;
  companyId?: string;
  coding: ICodingDetails;
}

// ==========================================
// Union Type for API Payloads
// ==========================================
export type ICreateQuestion =
  | ICreateMCQQuestion
  | ICreateWrittenQuestion
  | ICreateCodingQuestion;

// ==========================================
// Update Problem Types (aligned with backend schema)
// ==========================================
export interface IUpdateProblemPayload {
  title?: string;
  description?: string;
  type?: ProblemType;
  difficulty?: Difficulty;
  marks?: number;
  companyId?: string;
  mcq?: {
    explanation?: string;
    options?: ICreateMCQOptionPayload[];
  };
  written?: {
    wordLimit?: number;
    expectedAnswer?: string;
  };
  coding?: {
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    starterCode?: Record<string, string>;
    supportedLanguages?: string[];
    timeLimitMs?: number;
    memoryLimitMb?: number;
    testCases?: ITestCase[];
  };
}

export type IUpdateQuestion = IUpdateProblemPayload | ICreateQuestion;
