import apiClient from './apiClient';
import { CreateLocationInput, Location, PaginatedResult, UpdateLocationInput } from '../types/organization';
import { OrgListQuery } from './department.service';

export const locationService = {
  getLocations: async (query: OrgListQuery = {}, page = 1, limit = 10): Promise<PaginatedResult<Location>> => {
    const response = await apiClient.get('/organization/locations', { params: { ...query, page, limit } });
    return response.data.data as PaginatedResult<Location>;
  },
  getLocation: async (id: string): Promise<Location> => {
    const response = await apiClient.get(`/organization/locations/${id}`);
    return response.data.data as Location;
  },
  createLocation: async (data: CreateLocationInput): Promise<Location> => {
    const response = await apiClient.post('/organization/locations', data);
    return response.data.data as Location;
  },
  updateLocation: async (id: string, data: UpdateLocationInput): Promise<Location> => {
    const response = await apiClient.put(`/organization/locations/${id}`, data);
    return response.data.data as Location;
  },
  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/organization/locations/${id}`);
  },
  restoreLocation: async (id: string): Promise<Location> => {
    const response = await apiClient.post(`/organization/locations/${id}/restore`);
    return response.data.data as Location;
  },
};
