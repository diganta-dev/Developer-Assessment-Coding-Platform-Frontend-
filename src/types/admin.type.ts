import type { Difficulty, IPaginationMeta, ProblemType } from "./question.type";
import type { UserRole } from "./user.type";

export interface IAdminDashboardStats {
  users: {
    total: number;
    candidates: number;
    admins: number;
    superAdmins: number;
    active: number;
    inactive: number;
  };
  companies: {
    total: number;
    verified: number;
    unverified: number;
  };
  assessments: {
    total: number;
    draft: number;
    published: number;
    active: number;
    completed: number;
    expired?: number;
    archived: number;
  };
  submissions: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    evaluated: number;
  };
  attempts: {
    total: number;
    completed: number;
    inProgress: number;
    overallPassRate: number;
  };
  recentActivity: {
    newUsersLast30Days: number;
    assessmentsCreatedLast30Days: number;
    submissionsLast30Days: number;
  };
}

export interface IAdminDashboardStatsResponse {
  success: boolean;
  message: string;
  data: IAdminDashboardStats;
}

export interface ISystemStatistics {
  environment: string;
  nodeVersion: string;
  uptimeSeconds: number;
  processMemory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    externalMb: number;
  };
  databaseCounts: {
    users: number;
    companies: number;
    companyMembers: number;
    assessments: number;
    problems: number;
    assessmentAttempts: number;
    submissions: number;
    evaluations: number;
    results: number;
    antiCheatEvents: number;
  };
  security: {
    totalAntiCheatIncidents: number;
    incidentsByType: Record<string, number>;
    inactiveAccountsCount: number;
  };
  timestamp: string | Date;
}

export interface ISystemStatisticsResponse {
  success: boolean;
  message: string;
  data: ISystemStatistics;
}

export interface IUserFilterQuery {
  page?: number | string;
  limit?: number | string;
  searchTerm?: string;
  role?: UserRole;
  isActive?: boolean | string;
  isVerified?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IAdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  profilePictureUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  companyName?: string | null;
  totalAttempts: number;
  totalCreatedAssessments: number;
}

export interface IAdminUserListResponse {
  success: boolean;
  message: string;
  meta: IPaginationMeta;
  data: IAdminUserListItem[];
}

export interface IAdminUserDetails extends IAdminUserListItem {
  phone: string | null;
  bio: string | null;
  location: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  companyMemberships: Array<{
    companyId: string;
    companyName: string;
    role: string;
    joinedAt: string | Date;
  }>;
  recentAttempts: Array<{
    id: string;
    assessmentId: string;
    assessmentTitle: string;
    status: string;
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    resultStatus: string | null;
    createdAt: string | Date;
  }>;
}

export interface IAdminUserDetailsResponse {
  success: boolean;
  message: string;
  data: IAdminUserDetails;
}

export interface IUpdateUserStatusPayload {
  isActive?: boolean;
  role?: UserRole;
  isVerified?: boolean;
}

export interface IUpdateUserStatusResponse {
  success: boolean;
  message: string;
  data: IAdminUserListItem;
}

export interface IAdminCompanyListItem {
  id: string;
  name: string;
  slug: string;
  email: string;
  logoUrl: string | null;
  website: string | null;
  isVerified: boolean;
  totalMembers: number;
  totalAssessments: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IAdminCompanyListResponse {
  success: boolean;
  message: string;
  meta: IPaginationMeta;
  data: IAdminCompanyListItem[];
}

export interface ICompanyFilterQuery {
  page?: number | string;
  limit?: number | string;
  searchTerm?: string;
  isVerified?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
