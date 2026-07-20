import apiClient from './apiClient';
import { CreateRoleInput, Permission, Role, UpdateRoleInput } from '../types/roles';

export const roleService = {
  getRoles: async (search?: string): Promise<Role[]> => {
    const response = await apiClient.get('/roles', { params: search ? { search } : undefined });
    return response.data.data as Role[];
  },
  getRole: async (id: string): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data.data as Role;
  },
  createRole: async (data: CreateRoleInput): Promise<Role> => {
    const response = await apiClient.post('/roles', data);
    return response.data.data as Role;
  },
  updateRole: async (id: string, data: UpdateRoleInput): Promise<Role> => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data.data as Role;
  },
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
  assignPermissions: async (roleId: string, permissionCodes: string[]): Promise<Permission[]> => {
    const response = await apiClient.put(`/roles/${roleId}/permissions`, { permissionCodes });
    return response.data.data as Permission[];
  },
  getRoleEmployees: async (roleId: string, page = 1, limit = 10) => {
    const response = await apiClient.get(`/roles/${roleId}/employees`, { params: { page, limit } });
    return response.data.data;
  },
  getPermissionCatalog: async (category?: string): Promise<Permission[]> => {
    const response = await apiClient.get('/permissions', { params: category ? { category } : undefined });
    return response.data.data as Permission[];
  },
};
