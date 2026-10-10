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

export interface ICompanyMember {
  id?: string;
  userId?: string;
  companyId?: string;
  role: CompanyMemberRole | string;
  company?: any;
  joinedAt?: string;
  updatedAt?: string;
}

export interface ICandidateProfile {
  id?: string;
  userId?: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  profileImage?: string | null;
  profileImagePublicId?: string | null;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  resumeFileName?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateProfilePayload {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

export interface IUser {
  id?: string;
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  role: DashboardRole | string;
  companyId?: string | null;
  companyRole?: CompanyMemberRole | string | null;
  companyMembers?: ICompanyMember[];
  candidateProfile?: ICandidateProfile | null;
  avatar?: string;
  profilePictureUrl?: string | null;
  profilePicturePublicId?: string | null;
  status?: string;
  tokenVersion?: number;
  [key: string]: any;
}

