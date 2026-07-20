import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { employeeService } from '../services/employee.service';
import { CreateEmployeeInput, EmployeeListQuery, UpdateEmployeeInput } from '../types/employees';

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

// --- Employee Administration (Phase 4.1) ---
// Distinct query-key namespace ('employee'/'employees') from the self-service
// ('employeeProfile') hooks above, since the admin aggregate shape is materially
// richer (role, reportingManager, skillsSummary, certifications) — sharing a key
// would let whichever hook ran last silently overwrite the other's cache.

export const useEmployees = (params: EmployeeListQuery) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getEmployees(params),
    // Matches useWorkforceSearch's existing convention for paginated lists.
    keepPreviousData: true,
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) => employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateEmployeeInput }) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useRestoreEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.restoreEmployee(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useActivateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.activateEmployee(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.deactivateEmployee(id),
    onSuccess: (_data: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useAssignEmployeeRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, roleId }: { employeeId: string; roleId: string }) =>
      employeeService.assignRole(employeeId, roleId),
    onSuccess: (_data: unknown, variables: { employeeId: string; roleId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    },
  });
};
