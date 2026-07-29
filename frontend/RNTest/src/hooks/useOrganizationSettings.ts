import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationSettingsService } from '../services/organizationSettings.service';
import { UpdateOrganizationProfileInput, UpdateOrganizationSettingsInput } from '../types/organization';

export const useOrganizationProfile = () => {
  return useQuery({
    queryKey: ['organizationProfile'],
    queryFn: () => organizationSettingsService.getProfile(),
  });
};

export const useUpdateOrganizationProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationProfileInput) => organizationSettingsService.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizationProfile'] }),
  });
};

export const useOrganizationSettings = () => {
  return useQuery({
    queryKey: ['organizationSettings'],
    queryFn: () => organizationSettingsService.getSettings(),
  });
};

export const useUpdateOrganizationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationSettingsInput) => organizationSettingsService.updateSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizationSettings'] }),
  });
};
