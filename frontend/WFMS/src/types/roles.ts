export interface Permission {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissionCount?: number;
  employeeCount?: number;
  permissions?: Permission[];
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionCodes?: string[];
}

export type UpdateRoleInput = Partial<Pick<CreateRoleInput, 'name' | 'description'>> & { isActive?: boolean };
