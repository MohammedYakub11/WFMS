import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const permissions = user?.permissions ?? [];

  const hasPermission = (permission: string) => permissions.includes(permission);
  const hasRole = (...roles: string[]) => !!role && roles.includes(role);

  return {
    role,
    permissions,
    hasPermission,
    hasRole,
    isAdministrator: role === 'Administrator',
  };
};
