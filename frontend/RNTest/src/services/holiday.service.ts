import apiClient from './apiClient';
import { CreateHolidayInput, Holiday, PaginatedResult, UpdateHolidayInput } from '../types/organization';

export interface HolidayListQuery {
  year?: number;
  locationId?: string;
}

export const holidayService = {
  getHolidays: async (query: HolidayListQuery = {}, page = 1, limit = 50): Promise<PaginatedResult<Holiday>> => {
    const response = await apiClient.get('/organization/holidays', { params: { ...query, page, limit } });
    return response.data.data as PaginatedResult<Holiday>;
  },
  getHoliday: async (id: string): Promise<Holiday> => {
    const response = await apiClient.get(`/organization/holidays/${id}`);
    return response.data.data as Holiday;
  },
  createHoliday: async (data: CreateHolidayInput): Promise<Holiday> => {
    const response = await apiClient.post('/organization/holidays', data);
    return response.data.data as Holiday;
  },
  updateHoliday: async (id: string, data: UpdateHolidayInput): Promise<Holiday> => {
    const response = await apiClient.put(`/organization/holidays/${id}`, data);
    return response.data.data as Holiday;
  },
  deleteHoliday: async (id: string): Promise<void> => {
    await apiClient.delete(`/organization/holidays/${id}`);
  },
  restoreHoliday: async (id: string): Promise<Holiday> => {
    const response = await apiClient.post(`/organization/holidays/${id}/restore`);
    return response.data.data as Holiday;
  },
};
