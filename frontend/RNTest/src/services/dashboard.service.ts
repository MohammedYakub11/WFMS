import apiClient from './apiClient';
import { DashboardAnalytics, DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get('/dashboard/summary');
    return data.data as DashboardSummary;
  },
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const { data } = await apiClient.get('/dashboard/analytics');
    return data.data as DashboardAnalytics;
  },
};
