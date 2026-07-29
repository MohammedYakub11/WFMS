import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentService, OrgListQuery } from '../services/department.service';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../types/organization';

export const useDepartments = (query: OrgListQuery = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['departments', query, page, limit],
    queryFn: () => departmentService.getDepartments(query, page, limit),
    keepPreviousData: true,
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartment(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentInput) => departmentService.createDepartment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentInput }) =>
      departmentService.updateDepartment(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateDepartmentInput }) => {
      queryClient.invalidateQueries({ queryKey: ['department', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useRestoreDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.restoreDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
};
