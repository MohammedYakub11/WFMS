import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService, ReportHistoryQuery } from '../services/report.service';
import { downloadAndShareExport } from '../utils/exportFile';
import { ReportFilters, ReportFormat, ReportType } from '../types/reports';

export const useReportHistory = (query: ReportHistoryQuery, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['reportHistory', query, page, limit],
    queryFn: () => reportService.getHistory(query, page, limit),
    keepPreviousData: true,
  });
};

export const useReportHistoryItem = (id: string) => {
  return useQuery({
    queryKey: ['reportHistory', id],
    queryFn: () => reportService.getHistoryItem(id),
    enabled: !!id,
  });
};

export const usePreviewReport = () => {
  return useMutation({
    mutationFn: ({ reportType, filters }: { reportType: ReportType; filters: ReportFilters }) =>
      reportService.previewReport(reportType, filters),
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportType,
      format,
      filters,
    }: {
      reportType: ReportType;
      format: ReportFormat;
      filters: ReportFilters;
    }) => reportService.generateReport(reportType, format, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
    },
  });
};

// Composes generate (persists a ReportHistory row) + download (streams the file
// and hands it to the OS share sheet) into a single action, since "Generate &
// Download" and "Preview -> Download" both need this exact two-step flow and
// neither screen should duplicate it.
export const useGenerateAndDownloadReport = () => {
  const generateMutation = useGenerateReport();

  return useMutation({
    mutationFn: async ({
      reportType,
      format,
      filters,
    }: {
      reportType: ReportType;
      format: ReportFormat;
      filters: ReportFilters;
    }) => {
      const result = await generateMutation.mutateAsync({ reportType, format, filters });
      await downloadAndShareExport(`/reports/${result.id}/download`, undefined, format, reportType);
      return result;
    },
  });
};

export const useDeleteReportHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportService.deleteHistoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
    },
  });
};
