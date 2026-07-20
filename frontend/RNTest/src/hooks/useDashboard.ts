import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

const DASHBOARD_STALE_TIME_MS = 60 * 1000;

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardService.getSummary(),
    staleTime: DASHBOARD_STALE_TIME_MS,
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: () => dashboardService.getAnalytics(),
    staleTime: DASHBOARD_STALE_TIME_MS,
  });
};
