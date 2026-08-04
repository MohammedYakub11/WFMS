import apiClient from './apiClient';
import { BusinessUnit, CreateBusinessUnitInput, PaginatedResult, UpdateBusinessUnitInput } from '../types/organization';
import { OrgListQuery } from './department.service';

export const businessUnitService = {
  getBusinessUnits: async (query: OrgListQuery = {}, page = 1, limit = 10): Promise<PaginatedResult<BusinessUnit>> => {
    const response = await apiClient.get('/organization/business-units', { params: { ...query, page, limit } });
    return response.data.data as PaginatedResult<BusinessUnit>;
  },
  getBusinessUnit: async (id: string): Promise<BusinessUnit> => {
    const response = await apiClient.get(`/organization/business-units/${id}`);
    return response.data.data as BusinessUnit;
  },
  createBusinessUnit: async (data: CreateBusinessUnitInput): Promise<BusinessUnit> => {
    const response = await apiClient.post('/organization/business-units', data);
    return response.data.data as BusinessUnit;
  },
  updateBusinessUnit: async (id: string, data: UpdateBusinessUnitInput): Promise<BusinessUnit> => {
    const response = await apiClient.put(`/organization/business-units/${id}`, data);
    return response.data.data as BusinessUnit;
  },
  deleteBusinessUnit: async (id: string): Promise<void> => {
    await apiClient.delete(`/organization/business-units/${id}`);
  },
  restoreBusinessUnit: async (id: string): Promise<BusinessUnit> => {
    const response = await apiClient.post(`/organization/business-units/${id}/restore`);
    return response.data.data as BusinessUnit;
  },
};
