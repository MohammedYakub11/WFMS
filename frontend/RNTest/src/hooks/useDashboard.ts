import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface DashboardSummary {
  totalEmployees: number;
  totalSkills: number;
  departments: number;
  openRoles: number;
  topSkills: Array<{ name: string; count: number }>;
  profileCompletion: number;
}

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async (): Promise<DashboardSummary> => {
      const { data } = await apiClient.get('/dashboard/summary');
      return data.data as DashboardSummary;
    },
  });
};
