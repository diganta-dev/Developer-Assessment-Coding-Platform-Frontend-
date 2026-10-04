export interface ICompanyMemberItem {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  joinedAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ICompany {
  id: string;
  name: string;
  slug: string;
  email: string;
  isVerified: boolean;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  members?: ICompanyMemberItem[];
  assessments?: any[];
  problems?: any[];
  _count?: {
    members?: number;
    assessments?: number;
    problems?: number;
  };
}

export interface UpdateCompanyMemberRolePayload {
  role: string;
}
