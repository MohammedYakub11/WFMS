import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { designationService } from '../services/designation.service';
import { OrgListQuery } from '../services/department.service';
import { CreateDesignationInput, UpdateDesignationInput } from '../types/organization';

export const useDesignations = (query: OrgListQuery = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['designations', query, page, limit],
    queryFn: () => designationService.getDesignations(query, page, limit),
    keepPreviousData: true,
  });
};

export const useDesignation = (id: string) => {
  return useQuery({
    queryKey: ['designation', id],
    queryFn: () => designationService.getDesignation(id),
    enabled: !!id,
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDesignationInput) => designationService.createDesignation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDesignationInput }) =>
      designationService.updateDesignation(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateDesignationInput }) => {
      queryClient.invalidateQueries({ queryKey: ['designation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    },
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationService.deleteDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });
};

export const useRestoreDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationService.restoreDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });
};
