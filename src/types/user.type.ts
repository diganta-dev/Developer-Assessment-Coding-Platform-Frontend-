export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  CANDIDATE = "CANDIDATE",
}

export enum CompanyMemberRole {
  COMPANY_OWNER = "COMPANY_OWNER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  ASSESSMENT_CREATOR = "ASSESSMENT_CREATOR",
  EVALUATOR = "EVALUATOR",
}

export type DashboardRole = UserRole | CompanyMemberRole;

export interface IUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: DashboardRole;
  avatar?: string;
  status?: string;
  [key: string]: any;
}