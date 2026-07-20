import apiClient from './apiClient';
import {
  CreateEmployeeInput,
  EmployeeDetails,
  EmployeeListItem,
  EmployeeListQuery,
  UpdateEmployeeInput,
} from '../types/employees';

interface PaginatedEmployees {
  items: EmployeeListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const employeeService = {
  getEmployees: async (params: EmployeeListQuery): Promise<PaginatedEmployees> => {
    const response = await apiClient.get('/employees', { params });
    return response.data.data as PaginatedEmployees;
  },
  getEmployee: async (id: string): Promise<EmployeeDetails> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data.data as EmployeeDetails;
  },
  createEmployee: async (data: CreateEmployeeInput) => {
    const response = await apiClient.post('/employees', data);
    return response.data.data;
  },
  updateEmployee: async (id: string, data: UpdateEmployeeInput) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data.data;
  },
  deleteEmployee: async (id: string) => {
    await apiClient.delete(`/employees/${id}`);
  },
  restoreEmployee: async (id: string) => {
    const response = await apiClient.post(`/employees/${id}/restore`);
    return response.data.data;
  },
  activateEmployee: async (id: string) => {
    const response = await apiClient.patch(`/employees/${id}/activate`);
    return response.data.data;
  },
  deactivateEmployee: async (id: string) => {
    const response = await apiClient.patch(`/employees/${id}/deactivate`);
    return response.data.data;
  },
  assignRole: async (employeeId: string, roleId: string) => {
    const response = await apiClient.post('/roles/assignments', { employeeId, roleId });
    return response.data.data;
  },
};
