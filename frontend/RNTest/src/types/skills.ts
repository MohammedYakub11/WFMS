export interface SkillCategory {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Skill {
  id: string;
  categoryId: string;
  skillName: string;
  skillCode?: string | null;
  requiredCertification?: string | null;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: SkillCategory;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  skillId: string;
  proficiencyRating: number;
  yearsOfExperience?: number;
  isCertified?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  lastUsedDate?: string;
  createdAt: string;
  updatedAt: string;
  skill?: Skill;
}

// Legacy envelope shape (`{success,message,data:{data,total},errors}`). Kept only
// because it's still the type param used internally by a couple of unrelated
// `/employee-skills` endpoints in skill.service.ts (getEmployeeSkills, etc.).
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    total: number;
  };
  errors: any;
}

// New unwrapped list shape returned directly by the service layer for
// `/skills` and `/skill-categories` (and mirrored by `/employee-skills`),
// matching the backend's `{items,total,page,limit,totalPages}` contract.
export interface PaginatedListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
