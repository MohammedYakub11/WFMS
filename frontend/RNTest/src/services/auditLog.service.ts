import apiClient from './apiClient';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  module: string;
  entity: string;
  entityId: string | null;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; first_name: string; last_name: string } | null;
}

interface PaginatedAuditLog {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditLogService = {
  getEmployeeAuditLog: async (employeeId: string, page = 1, limit = 20): Promise<PaginatedAuditLog> => {
    const response = await apiClient.get('/audit-logs', {
      params: { entity: 'Employee', entityId: employeeId, page, limit },
    });
    return response.data.data as PaginatedAuditLog;
  },
};
