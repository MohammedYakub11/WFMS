import apiClient from './apiClient';
import {
  GeneratedReportResult,
  PaginatedReportHistory,
  ReportFilters,
  ReportFormat,
  ReportHistoryEntry,
  ReportPreviewResult,
  ReportType,
} from '../types/reports';

export interface ReportHistoryQuery {
  reportType?: ReportType;
  format?: ReportFormat;
  generatedBy?: string;
}

export const reportService = {
  previewReport: async (reportType: ReportType, filters: ReportFilters): Promise<ReportPreviewResult> => {
    const response = await apiClient.post('/reports/preview', { reportType, filters });
    return response.data.data as ReportPreviewResult;
  },

  generateReport: async (
    reportType: ReportType,
    format: ReportFormat,
    filters: ReportFilters,
  ): Promise<GeneratedReportResult> => {
    const response = await apiClient.post('/reports/generate', { reportType, format, filters });
    return response.data.data as GeneratedReportResult;
  },

  getHistory: async (
    query: ReportHistoryQuery,
    page = 1,
    limit = 20,
  ): Promise<PaginatedReportHistory> => {
    const response = await apiClient.get('/reports/history', { params: { ...query, page, limit } });
    return response.data.data as PaginatedReportHistory;
  },

  getHistoryItem: async (id: string): Promise<ReportHistoryEntry> => {
    const response = await apiClient.get(`/reports/history/${id}`);
    return response.data.data as ReportHistoryEntry;
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/history/${id}`);
  },
};
