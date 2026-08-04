import apiClient from './apiClient';
import { CreateDesignationInput, Designation, PaginatedResult, UpdateDesignationInput } from '../types/organization';
import { OrgListQuery } from './department.service';

export const designationService = {
  getDesignations: async (query: OrgListQuery = {}, page = 1, limit = 10): Promise<PaginatedResult<Designation>> => {
    const response = await apiClient.get('/organization/designations', { params: { ...query, page, limit } });
    return response.data.data as PaginatedResult<Designation>;
  },
  getDesignation: async (id: string): Promise<Designation> => {
    const response = await apiClient.get(`/organization/designations/${id}`);
    return response.data.data as Designation;
  },
  createDesignation: async (data: CreateDesignationInput): Promise<Designation> => {
    const response = await apiClient.post('/organization/designations', data);
    return response.data.data as Designation;
  },
  updateDesignation: async (id: string, data: UpdateDesignationInput): Promise<Designation> => {
    const response = await apiClient.put(`/organization/designations/${id}`, data);
    return response.data.data as Designation;
  },
  deleteDesignation: async (id: string): Promise<void> => {
    await apiClient.delete(`/organization/designations/${id}`);
  },
  restoreDesignation: async (id: string): Promise<Designation> => {
    const response = await apiClient.post(`/organization/designations/${id}/restore`);
    return response.data.data as Designation;
  },
};
