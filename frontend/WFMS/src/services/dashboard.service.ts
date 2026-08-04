import apiClient from './apiClient';
import {
  ApprovalsAnalytics,
  CertificationAnalytics,
  DashboardAnalytics,
  DashboardSummary,
  DepartmentKpi,
  SkillGapItem,
  Trends,
  WorkforceDistribution,
} from '../types/dashboard';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get('/dashboard/summary');
    return data.data as DashboardSummary;
  },
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const { data } = await apiClient.get('/dashboard/analytics');
    return data.data as DashboardAnalytics;
  },
  getDepartmentKpis: async (): Promise<DepartmentKpi[]> => {
    const { data } = await apiClient.get('/dashboard/department-kpis');
    return data.data as DepartmentKpi[];
  },
  getSkillGapAnalysis: async (): Promise<SkillGapItem[]> => {
    const { data } = await apiClient.get('/dashboard/skill-gap');
    return data.data as SkillGapItem[];
  },
  getCertificationAnalytics: async (): Promise<CertificationAnalytics> => {
    const { data } = await apiClient.get('/dashboard/certifications');
    return data.data as CertificationAnalytics;
  },
  getApprovalsAnalytics: async (): Promise<ApprovalsAnalytics> => {
    const { data } = await apiClient.get('/dashboard/approvals-analytics');
    return data.data as ApprovalsAnalytics;
  },
  getWorkforceDistribution: async (): Promise<WorkforceDistribution> => {
    const { data } = await apiClient.get('/dashboard/workforce-distribution');
    return data.data as WorkforceDistribution;
  },
  getTrends: async (): Promise<Trends> => {
    const { data } = await apiClient.get('/dashboard/trends');
    return data.data as Trends;
  },
};
