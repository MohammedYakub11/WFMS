import apiClient from './apiClient';
import { SkillCategory, Skill, EmployeeSkill, PaginatedResponse, PaginatedListResult } from '../types/skills';

export const skillService = {
  // Categories
  getCategories: async (params?: any): Promise<PaginatedListResult<SkillCategory>> => {
    const response = await apiClient.get('/skill-categories', { params });
    return response.data.data;
  },
  getCategory: async (id: string): Promise<SkillCategory> => {
    const response = await apiClient.get(`/skill-categories/${id}`);
    return response.data.data as SkillCategory;
  },
  createCategory: async (data: Partial<SkillCategory>): Promise<SkillCategory> => {
    const response = await apiClient.post('/skill-categories', data);
    return response.data.data;
  },
  updateCategory: async (id: string, data: Partial<SkillCategory>): Promise<SkillCategory> => {
    const response = await apiClient.put(`/skill-categories/${id}`, data);
    return response.data.data;
  },
  deleteCategory: async (id: string) => {
    await apiClient.delete(`/skill-categories/${id}`);
  },
  restoreCategory: (id: string) =>
    apiClient.post(`/skill-categories/${id}/restore`).then((r) => r.data.data as SkillCategory),
  activateCategory: (id: string) =>
    apiClient.patch(`/skill-categories/${id}/activate`).then((r) => r.data.data as SkillCategory),
  deactivateCategory: (id: string) =>
    apiClient.patch(`/skill-categories/${id}/deactivate`).then((r) => r.data.data as SkillCategory),
  bulkCategoryStatus: (ids: string[], action: 'activate' | 'deactivate') =>
    apiClient
      .post('/skill-categories/bulk-status', { ids, action })
      .then((r) => r.data.data as { requested: number; affected: number }),
  bulkDeleteCategories: (ids: string[]) =>
    apiClient
      .post('/skill-categories/bulk-delete', { ids })
      .then((r) => r.data.data as { requested: number; affected: number }),
  exportCategories: (format: 'csv' | 'xlsx', params?: Record<string, unknown>) =>
    apiClient
      .get('/skill-categories/export', { params: { ...params, format }, responseType: 'blob' })
      .then((r) => r.data),

  // Skills
  getSkills: async (params?: any): Promise<PaginatedListResult<Skill>> => {
    const response = await apiClient.get('/skills', { params });
    return response.data.data;
  },
  getSkill: async (id: string): Promise<Skill> => {
    const response = await apiClient.get(`/skills/${id}`);
    return response.data.data as Skill;
  },
  createSkill: async (data: Partial<Skill>): Promise<Skill> => {
    const response = await apiClient.post('/skills', data);
    return response.data.data;
  },
  updateSkill: async (id: string, data: Partial<Skill>): Promise<Skill> => {
    const response = await apiClient.put(`/skills/${id}`, data);
    return response.data.data;
  },
  deleteSkill: async (id: string) => {
    await apiClient.delete(`/skills/${id}`);
  },
  restoreSkill: (id: string) => apiClient.post(`/skills/${id}/restore`).then((r) => r.data.data as Skill),
  activateSkill: (id: string) => apiClient.patch(`/skills/${id}/activate`).then((r) => r.data.data as Skill),
  deactivateSkill: (id: string) => apiClient.patch(`/skills/${id}/deactivate`).then((r) => r.data.data as Skill),
  bulkSkillStatus: (ids: string[], action: 'activate' | 'deactivate') =>
    apiClient
      .post('/skills/bulk-status', { ids, action })
      .then((r) => r.data.data as { requested: number; affected: number }),
  bulkDeleteSkills: (ids: string[]) =>
    apiClient
      .post('/skills/bulk-delete', { ids })
      .then((r) => r.data.data as { requested: number; affected: number }),
  exportSkills: (format: 'csv' | 'xlsx', params?: Record<string, unknown>) =>
    apiClient
      .get('/skills/export', { params: { ...params, format }, responseType: 'blob' })
      .then((r) => r.data),

  // Employee Skills
  getEmployeeSkills: async (params?: any) => {
    const response = await apiClient.get<PaginatedResponse<EmployeeSkill>>('/employee-skills', { params });
    return response.data;
  },
  getEmployeeSkillDetail: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: EmployeeSkill }>(`/employee-skills/${id}`);
    return response.data.data;
  },
  createEmployeeSkill: async (data: Partial<EmployeeSkill>) => {
    const response = await apiClient.post<EmployeeSkill>('/employee-skills', data);
    return response.data;
  },
  updateEmployeeSkill: async (id: string, data: Partial<EmployeeSkill>) => {
    const response = await apiClient.patch<EmployeeSkill>(`/employee-skills/${id}`, data);
    return response.data;
  },
  deleteEmployeeSkill: async (id: string) => {
    await apiClient.delete(`/employee-skills/${id}`);
  },

  // Manager Approval Workflows
  getPendingSkills: async (params?: any) => {
    const response = await apiClient.get<PaginatedResponse<EmployeeSkill>>('/employee-skills/pending', { params });
    return response.data;
  },
  approveSkill: async (id: string, comments?: string) => {
    const response = await apiClient.patch<EmployeeSkill>(`/employee-skills/${id}/approve`, { comments });
    return response.data;
  },
  rejectSkill: async (id: string, comments?: string) => {
    const response = await apiClient.patch<EmployeeSkill>(`/employee-skills/${id}/reject`, { comments });
    return response.data;
  },
  requestSkillChanges: async (id: string, comments: string) => {
    const response = await apiClient.patch<EmployeeSkill>(`/employee-skills/${id}/request-changes`, { comments });
    return response.data;
  },
};
