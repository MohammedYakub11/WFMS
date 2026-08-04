export interface EmployeeListItem {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  experience?: number;
  location?: string;
  profile_image?: string;
  status: string;
  created_at: string;
  updated_at: string;
  deletedAt?: string | null;
  reportingManagerId?: string | null;
}

export interface EmployeeRoleRef {
  id: string;
  name: string;
}

export interface TopSkillRef {
  skillName?: string;
  proficiencyRating: number;
}

export interface CertificationRef {
  skillName?: string;
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface EmployeeDetails extends EmployeeListItem {
  profile_metadata?: {
    about_me?: string;
    address?: string;
    emergency_contact?: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    portfolio_url?: string;
  } | null;
  reportingManager?: {
    id: string;
    first_name: string;
    last_name: string;
    designation?: string;
  } | null;
  role: EmployeeRoleRef | null;
  skillsSummary: {
    totalSkills: number;
    certifiedCount: number;
    averageProficiency: number;
    topSkills: TopSkillRef[];
  };
  certifications: CertificationRef[];
}

export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  department?: string | null;
  designation?: string | null;
  status?: string | null;
  location?: string | null;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateEmployeeInput {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  designation?: string;
  department?: string;
  experience?: number;
  location?: string;
  reportingManagerId?: string;
  roleId?: string;
}

export type UpdateEmployeeInput = Partial<Omit<CreateEmployeeInput, 'password' | 'roleId'>>;
