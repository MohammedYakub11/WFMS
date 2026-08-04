import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services/skill.service';
import { Skill } from '../types/skills';

// Distinct query-key namespace ('skillsAdmin'/'skillAdmin') from the employee-facing
// ('skills'/'skillCategories') read-only hooks in useSkills.ts, since this admin
// surface hits the same /skills endpoints but drives a different directory/filter
// UI (skillAdminDirectorySlice) — sharing a key would let either invalidate/refetch
// the other unexpectedly.

export const useSkillsAdmin = (params?: any) => {
  return useQuery({
    queryKey: ['skillsAdmin', params],
    queryFn: () => skillService.getSkills(params),
    keepPreviousData: true,
  });
};

export const useSkillAdmin = (id: string) => {
  return useQuery({
    queryKey: ['skillAdmin', id],
    queryFn: () => skillService.getSkill(id),
    enabled: !!id,
  });
};

export const useCreateSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Skill>) => skillService.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
    },
  });
};

export const useUpdateSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) => skillService.updateSkill(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: Partial<Skill> }) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillAdmin', variables.id] });
    },
  });
};

export const useDeleteSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.deleteSkill(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] });
    },
  });
};

export const useRestoreSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.restoreSkill(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] });
    },
  });
};

export const useActivateSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.activateSkill(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] });
    },
  });
};

export const useDeactivateSkillAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.deactivateSkill(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] });
    },
  });
};

export const useBulkActivateSkillsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkSkillStatus(ids, 'activate'),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] }));
    },
  });
};

export const useBulkDeactivateSkillsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkSkillStatus(ids, 'deactivate'),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] }));
    },
  });
};

export const useBulkDeleteSkillsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkDeleteSkills(ids),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillsAdmin'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillAdmin', id] }));
    },
  });
};

export const useExportSkills = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'xlsx'; filters?: Record<string, unknown> }) =>
      skillService.exportSkills(format, filters),
  });
};
