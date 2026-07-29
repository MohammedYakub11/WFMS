import apiClient from './apiClient';
import { CreateDepartmentInput, Department, PaginatedResult, UpdateDepartmentInput } from '../types/organization';

export interface OrgListQuery {
  search?: string;
  status?: 'active' | 'inactive';
  includeDeleted?: boolean;
}

export const departmentService = {
  getDepartments: async (query: OrgListQuery = {}, page = 1, limit = 10): Promise<PaginatedResult<Department>> => {
    const response = await apiClient.get('/organization/departments', { params: { ...query, page, limit } });
    return response.data.data as PaginatedResult<Department>;
  },
  getDepartment: async (id: string): Promise<Department> => {
    const response = await apiClient.get(`/organization/departments/${id}`);
    return response.data.data as Department;
  },
  createDepartment: async (data: CreateDepartmentInput): Promise<Department> => {
    const response = await apiClient.post('/organization/departments', data);
    return response.data.data as Department;
  },
  updateDepartment: async (id: string, data: UpdateDepartmentInput): Promise<Department> => {
    const response = await apiClient.put(`/organization/departments/${id}`, data);
    return response.data.data as Department;
  },
  deleteDepartment: async (id: string): Promise<void> => {
    await apiClient.delete(`/organization/departments/${id}`);
  },
  restoreDepartment: async (id: string): Promise<Department> => {
    const response = await apiClient.post(`/organization/departments/${id}/restore`);
    return response.data.data as Department;
  },
};
