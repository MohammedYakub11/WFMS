import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillService } from '../services/skill.service';
import { SkillCategory } from '../types/skills';

// Distinct query-key namespace ('skillCategoriesAdmin'/'skillCategoryAdmin') from the
// employee-facing ('skillCategories') read-only hook in useSkills.ts. Category
// mutations here ALSO invalidate the ['skillCategories'] key so the Skill Form's
// category dropdown (which reads via useSkillCategories) stays fresh.

export const useCategoriesAdmin = (params?: any) => {
  return useQuery({
    queryKey: ['skillCategoriesAdmin', params],
    queryFn: () => skillService.getCategories(params),
    keepPreviousData: true,
  });
};

export const useCategoryAdmin = (id: string) => {
  return useQuery({
    queryKey: ['skillCategoryAdmin', id],
    queryFn: () => skillService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SkillCategory>) => skillService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useUpdateCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SkillCategory> }) =>
      skillService.updateCategory(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: Partial<SkillCategory> }) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useDeleteCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.deleteCategory(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useRestoreCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.restoreCategory(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useActivateCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.activateCategory(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useDeactivateCategoryAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillService.deactivateCategory(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
    },
  });
};

export const useBulkActivateCategoriesAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkCategoryStatus(ids, 'activate'),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] }));
    },
  });
};

export const useBulkDeactivateCategoriesAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkCategoryStatus(ids, 'deactivate'),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] }));
    },
  });
};

export const useBulkDeleteCategoriesAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => skillService.bulkDeleteCategories(ids),
    onSuccess: (_data: unknown, ids: string[]) => {
      queryClient.invalidateQueries({ queryKey: ['skillCategoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
      ids.forEach((id) => queryClient.invalidateQueries({ queryKey: ['skillCategoryAdmin', id] }));
    },
  });
};

export const useExportCategories = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'xlsx'; filters?: Record<string, unknown> }) =>
      skillService.exportCategories(format, filters),
  });
};
