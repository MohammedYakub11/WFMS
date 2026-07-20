import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { EmptyState } from '../components/EmptyState';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedScreenProps {
  allowedRoles?: string[];
  requiredPermission?: string;
  children: React.ReactNode;
}

// Wraps a screen registration in AppStack so an unauthorized user always sees an
// explicit Access Restricted state rather than a blank screen or a crash — covers
// both menu-driven navigation and any stale deep-link/back-stack access attempt.
export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  allowedRoles,
  requiredPermission,
  children,
}) => {
  const navigation = useNavigation<any>();
  const { hasRole, hasPermission } = usePermissions();

  const isAuthorized =
    (!allowedRoles || hasRole(...allowedRoles)) &&
    (!requiredPermission || hasPermission(requiredPermission));

  if (!isAuthorized) {
    return (
      <EmptyState
        title="Access Restricted"
        description="You don't have permission to view this screen."
        actionTitle="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return <>{children}</>;
};
