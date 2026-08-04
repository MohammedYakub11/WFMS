import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessUnitService } from '../services/businessUnit.service';
import { OrgListQuery } from '../services/department.service';
import { CreateBusinessUnitInput, UpdateBusinessUnitInput } from '../types/organization';

export const useBusinessUnits = (query: OrgListQuery = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['businessUnits', query, page, limit],
    queryFn: () => businessUnitService.getBusinessUnits(query, page, limit),
    keepPreviousData: true,
  });
};

export const useBusinessUnit = (id: string) => {
  return useQuery({
    queryKey: ['businessUnit', id],
    queryFn: () => businessUnitService.getBusinessUnit(id),
    enabled: !!id,
  });
};

export const useCreateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusinessUnitInput) => businessUnitService.createBusinessUnit(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessUnits'] }),
  });
};

export const useUpdateBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBusinessUnitInput }) =>
      businessUnitService.updateBusinessUnit(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateBusinessUnitInput }) => {
      queryClient.invalidateQueries({ queryKey: ['businessUnit', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['businessUnits'] });
    },
  });
};

export const useDeleteBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessUnitService.deleteBusinessUnit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessUnits'] }),
  });
};

export const useRestoreBusinessUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessUnitService.restoreBusinessUnit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businessUnits'] }),
  });
};
