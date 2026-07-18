import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services/skill.service';
import { SkillCategory, Skill, EmployeeSkill } from '../types/skills';

export const useSkillCategories = (params?: any) => {
  return useQuery({
    queryKey: ['skillCategories', params],
    queryFn: () => skillService.getCategories(params),
  });
};

export const useSkills = (params?: any) => {
  return useQuery({
    queryKey: ['skills', params],
    queryFn: () => skillService.getSkills(params),
  });
};

export const useEmployeeSkills = (params?: any) => {
  return useQuery({
    queryKey: ['employeeSkills', params],
    queryFn: () => skillService.getEmployeeSkills(params),
  });
};

export const useEmployeeSkillDetail = (id: string) => {
  return useQuery({
    queryKey: ['employeeSkillDetail', id],
    queryFn: () => skillService.getEmployeeSkillDetail(id),
    enabled: !!id,
  });
};

export const useDeleteEmployeeSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.deleteEmployeeSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
    },
  });
};

// Manager Approval Workflows
export const usePendingSkills = (params?: any) => {
  return useQuery({
    queryKey: ['pendingSkills', params],
    queryFn: () => skillService.getPendingSkills(params),
  });
};

export const useApproveSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => skillService.approveSkill(id, comments),
    onSuccess: (_: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkillDetail', id] });
    },
  });
};

export const useRejectSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => skillService.rejectSkill(id, comments),
    onSuccess: (_: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkillDetail', id] });
    },
  });
};

export const useRequestChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) => skillService.requestSkillChanges(id, comments),
    onSuccess: (_: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkillDetail', id] });
    },
  });
};

export const useCreateEmployeeSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeSkill>) => skillService.createEmployeeSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] });
    },
  });
};

export const useUpdateEmployeeSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeSkill> }) => skillService.updateEmployeeSkill(id, data),
    onSuccess: (_: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['employeeSkills'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSkillDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] });
    },
  });
};
