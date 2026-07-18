import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface EmployeeProfile {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  experience?: number;
  location?: string;
  profile_image?: string;
  status: string;
  profile_metadata?: {
    about_me?: string;
    address?: string;
    emergency_contact?: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    portfolio_url?: string;
  };
}

export const useEmployeeProfile = (id: string) => {
  return useQuery({
    queryKey: ['employeeProfile', id],
    queryFn: async (): Promise<EmployeeProfile> => {
      const { data } = await apiClient.get(`/employees/${id}`);
      return data.data as EmployeeProfile;
    },
    enabled: !!id,
  });
};

export const useUpdateEmployeeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeProfile> }) => {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data.data as EmployeeProfile;
    },
    onSuccess: (data: EmployeeProfile, variables: { id: string; data: Partial<EmployeeProfile> }) => {
      queryClient.setQueryData(['employeeProfile', variables.id], data);
    },
  });
};
