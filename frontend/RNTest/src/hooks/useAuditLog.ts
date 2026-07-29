import { useQuery } from '@tanstack/react-query';
import { auditLogService, AuditLogFilters } from '../services/auditLog.service';

export const useEmployeeAuditLog = (employeeId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['employeeAuditLog', employeeId, page, limit],
    queryFn: () => auditLogService.getEmployeeAuditLog(employeeId, page, limit),
    enabled: !!employeeId,
  });
};

export const useAuditLogs = (filters: AuditLogFilters, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['auditLogs', filters, page, limit],
    queryFn: () => auditLogService.getAuditLogs(filters, page, limit),
    keepPreviousData: true,
  });
};
