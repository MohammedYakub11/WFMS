import apiClient from './apiClient';
import {
  OrganizationProfile,
  OrganizationSettings,
  UpdateOrganizationProfileInput,
  UpdateOrganizationSettingsInput,
} from '../types/organization';

export const organizationSettingsService = {
  getProfile: async (): Promise<OrganizationProfile> => {
    const response = await apiClient.get('/organization/profile');
    return response.data.data as OrganizationProfile;
  },
  updateProfile: async (data: UpdateOrganizationProfileInput): Promise<OrganizationProfile> => {
    const response = await apiClient.put('/organization/profile', data);
    return response.data.data as OrganizationProfile;
  },
  getSettings: async (): Promise<OrganizationSettings> => {
    const response = await apiClient.get('/organization/settings');
    return response.data.data as OrganizationSettings;
  },
  updateSettings: async (data: UpdateOrganizationSettingsInput): Promise<OrganizationSettings> => {
    const response = await apiClient.put('/organization/settings', data);
    return response.data.data as OrganizationSettings;
  },
};
