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

// Each of these backs a manager/admin-only widget (VIEW_ANALYTICS). Callers pass
// `enabled` from usePermissions() so Employees — who lack VIEW_ANALYTICS — never
// issue a request the backend would reject.
export const useDashboardAnalytics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: () => dashboardService.getAnalytics(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useDepartmentKpis = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['departmentKpis'],
    queryFn: () => dashboardService.getDepartmentKpis(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useSkillGapAnalysis = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['skillGapAnalysis'],
    queryFn: () => dashboardService.getSkillGapAnalysis(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useCertificationAnalytics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['certificationAnalytics'],
    queryFn: () => dashboardService.getCertificationAnalytics(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useApprovalsAnalytics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['approvalsAnalytics'],
    queryFn: () => dashboardService.getApprovalsAnalytics(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useWorkforceDistribution = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['workforceDistribution'],
    queryFn: () => dashboardService.getWorkforceDistribution(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};

export const useAnalyticsTrends = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['analyticsTrends'],
    queryFn: () => dashboardService.getTrends(),
    staleTime: DASHBOARD_STALE_TIME_MS,
    enabled,
  });
};
