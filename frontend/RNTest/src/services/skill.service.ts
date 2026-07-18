import apiClient from './apiClient';
import { SkillCategory, Skill, EmployeeSkill, PaginatedResponse } from '../types/skills';

export const skillService = {
  // Categories
  getCategories: async (params?: any) => {
    const response = await apiClient.get<PaginatedResponse<SkillCategory>>('/skill-categories', { params });
    return response.data;
  },
  createCategory: async (data: Partial<SkillCategory>) => {
    const response = await apiClient.post<SkillCategory>('/skill-categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: Partial<SkillCategory>) => {
    const response = await apiClient.put<SkillCategory>(`/skill-categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    await apiClient.delete(`/skill-categories/${id}`);
  },

  // Skills
  getSkills: async (params?: any) => {
    const response = await apiClient.get<PaginatedResponse<Skill>>('/skills', { params });
    return response.data;
  },
  createSkill: async (data: Partial<Skill>) => {
    const response = await apiClient.post<Skill>('/skills', data);
    return response.data;
  },
  updateSkill: async (id: string, data: Partial<Skill>) => {
    const response = await apiClient.put<Skill>(`/skills/${id}`, data);
    return response.data;
  },
  deleteSkill: async (id: string) => {
    await apiClient.delete(`/skills/${id}`);
  },

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
