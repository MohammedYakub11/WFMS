import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import { CreateRoleInput, Role, UpdateRoleInput } from '../types/roles';

export const useRoles = (search?: string) => {
  return useQuery({
    queryKey: ['roles', search],
    queryFn: () => roleService.getRoles(search),
  });
};

// Powers the Permission Matrix — the list endpoint only returns permission counts,
// not the full permission set per role, so we fetch each role's full detail.
// Composed as a single query (rather than react-query's useQueries) since this
// project's react-query type declarations are overridden to a minimal stub that
// doesn't expose useQueries — see src/types/declarations.d.ts.
export const useRolesWithPermissions = (roles: Role[]) => {
  const roleIds = roles.map((r) => r.id).join(',');
  const { data, isLoading } = useQuery({
    queryKey: ['rolesWithPermissions', roleIds],
    queryFn: () => Promise.all(roles.map((role) => roleService.getRole(role.id))),
    enabled: roles.length > 0,
  });

  return { rolesWithPermissions: data ?? roles, isLoading: roles.length > 0 && isLoading };
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getRole(id),
    enabled: !!id,
  });
};

// Fixed catalog — matches the "static lookup" 1hr staleTime convention (useSearchMetadata).
export const usePermissionCatalog = () => {
  return useQuery({
    queryKey: ['permissionCatalog'],
    queryFn: () => roleService.getPermissionCatalog(),
    staleTime: 1000 * 60 * 60,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => roleService.updateRole(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateRoleInput }) => {
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useAssignPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionCodes }: { roleId: string; permissionCodes: string[] }) =>
      roleService.assignPermissions(roleId, permissionCodes),
    onSuccess: (_data: unknown, variables: { roleId: string; permissionCodes: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
