export interface SkillCategory {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  categoryId: string;
  skillName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    total: number;
  };
  errors: any;
}
