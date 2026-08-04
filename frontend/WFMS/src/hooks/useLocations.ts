import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/location.service';
import { OrgListQuery } from '../services/department.service';
import { CreateLocationInput, UpdateLocationInput } from '../types/organization';

export const useLocations = (query: OrgListQuery = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['locations', query, page, limit],
    queryFn: () => locationService.getLocations(query, page, limit),
    keepPreviousData: true,
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocation(id),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationInput) => locationService.createLocation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationInput }) => locationService.updateLocation(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateLocationInput }) => {
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.deleteLocation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });
};

export const useRestoreLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.restoreLocation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });
};
