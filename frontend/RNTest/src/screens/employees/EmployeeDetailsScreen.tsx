import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card, StatCard } from '../../components/Cards';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { SkillTimeline, TimelineEvent } from '../../components/common/SkillTimeline';
import {
  useEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
  useDeleteEmployee,
  useRestoreEmployee,
} from '../../hooks/useEmployee';
import { useEmployeeAuditLog } from '../../hooks/useAuditLog';
import { AuditLogEntry } from '../../services/auditLog.service';
import { getAuditActionLabel } from '../../utils/auditActionLabels';
import { CertificationRef } from '../../types/employees';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const EmployeeDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { employeeId } = route.params;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const { data: employee, isLoading, isError, refetch } = useEmployee(employeeId);
  const { data: auditLog } = useEmployeeAuditLog(employeeId);

  const activateMutation = useActivateEmployee();
  const deactivateMutation = useDeactivateEmployee();
  const deleteMutation = useDeleteEmployee();
  const restoreMutation = useRestoreEmployee();

  const [confirmAction, setConfirmAction] = useState<'delete' | 'restore' | null>(null);

  const canUpdate = hasPermission('EMPLOYEE_UPDATE');
  const canDelete = hasPermission('EMPLOYEE_DELETE');

  const handleToggleStatus = () => {
    if (!employee) return;
    const mutation = employee.status === 'active' ? deactivateMutation : activateMutation;
    mutation.mutate(employeeId, {
      onSuccess: () => showSnackbar(`Employee ${employee.status === 'active' ? 'deactivated' : 'activated'}`, 'success'),
      onError: () => showSnackbar('Failed to update employee status', 'error'),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(employeeId, {
      onSuccess: () => {
        showSnackbar('Employee deleted', 'success');
        setConfirmAction(null);
        navigation.goBack();
      },
      onError: () => {
        showSnackbar('Failed to delete employee', 'error');
        setConfirmAction(null);
      },
    });
  };

  const handleRestore = () => {
    restoreMutation.mutate(employeeId, {
      onSuccess: () => {
        showSnackbar('Employee restored', 'success');
        setConfirmAction(null);
      },
      onError: () => {
        showSnackbar('Failed to restore employee', 'error');
        setConfirmAction(null);
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Employee Details" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !employee) {
    return (
      <View style={styles.container}>
        <AppHeader title="Employee Details" showBack />
        <EmptyState
          title="Unable to load employee"
          description="We couldn't fetch this employee's details. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const fullName = `${employee.first_name} ${employee.last_name}`;
  const isDeleted = !!employee.deletedAt;

  const timelineEvents: TimelineEvent[] = (auditLog?.items || []).map((entry: AuditLogEntry) => ({
    id: entry.id,
    title: getAuditActionLabel(entry.action),
    description: entry.user ? `by ${entry.user.first_name} ${entry.user.last_name}` : undefined,
    timestamp: entry.createdAt,
  }));

  return (
    <View style={styles.container}>
      <AppHeader
        title="Employee Details"
        showBack
        rightAction={
          canUpdate && !isDeleted ? (
            <AppText
              variant="buttonText"
              color={theme.colors.primary}
              onPress={() => navigation.navigate('EditEmployee', { employeeId })}
            >
              Edit
            </AppText>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Avatar name={fullName} uri={employee.profile_image} size={64} />
            <View style={styles.headerText}>
              <AppText variant="h1">{fullName}</AppText>
              <AppText color={theme.colors.textSecondary}>{employee.designation || 'No designation'}</AppText>
              <View style={[styles.statusBadge, { backgroundColor: employee.status === 'active' ? theme.colors.statusActive : theme.colors.statusDisabled }]}>
                <AppText variant="caption" style={styles.statusText}>
                  {isDeleted ? 'Deleted' : employee.status === 'active' ? 'Active' : 'Inactive'}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Personal Information</AppText>
          <InfoRow label="Employee Code" value={employee.employee_code} theme={theme} />
          <InfoRow label="First Name" value={employee.first_name} theme={theme} />
          <InfoRow label="Last Name" value={employee.last_name} theme={theme} />
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Contact Information</AppText>
          <InfoRow label="Email" value={employee.email} theme={theme} />
          <InfoRow label="Phone" value={employee.phone || '—'} theme={theme} />
          <InfoRow label="Address" value={employee.profile_metadata?.address || '—'} theme={theme} />
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Employment Information</AppText>
          <InfoRow label="Department" value={employee.department || '—'} theme={theme} />
          <InfoRow label="Designation" value={employee.designation || '—'} theme={theme} />
          <InfoRow label="Location" value={employee.location || '—'} theme={theme} />
          <InfoRow label="Experience" value={`${employee.experience ?? 0} years`} theme={theme} />
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Reporting Manager</AppText>
          {employee.reportingManager ? (
            <AppText
              color={theme.colors.primary}
              onPress={() =>
                navigation.push('EmployeeDetails', { employeeId: employee.reportingManager!.id })
              }
            >
              {employee.reportingManager.first_name} {employee.reportingManager.last_name}
              {employee.reportingManager.designation ? ` — ${employee.reportingManager.designation}` : ''}
            </AppText>
          ) : (
            <AppText color={theme.colors.textSecondary}>Not assigned</AppText>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Skills Summary</AppText>
          <View style={styles.statsRow}>
            <StatCard title="Total Skills" value={employee.skillsSummary.totalSkills} />
            <StatCard title="Avg. Proficiency" value={employee.skillsSummary.averageProficiency} />
            <StatCard title="Certifications" value={employee.skillsSummary.certifiedCount} />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Certifications</AppText>
          {employee.certifications.length === 0 ? (
            <AppText color={theme.colors.textSecondary}>No certifications recorded.</AppText>
          ) : (
            employee.certifications.map((cert: CertificationRef, index: number) => (
              <View key={index} style={styles.certRow}>
                <AppText weight="semiBold">{cert.certificationName || cert.skillName}</AppText>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  {cert.issuingOrganization || 'Unknown organization'}
                </AppText>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Timeline</AppText>
          {timelineEvents.length === 0 ? (
            <AppText color={theme.colors.textSecondary}>No activity recorded yet.</AppText>
          ) : (
            <SkillTimeline events={timelineEvents} />
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h2" style={styles.sectionTitle}>Audit Information</AppText>
          <InfoRow label="Created" value={new Date(employee.created_at).toLocaleString()} theme={theme} />
          <InfoRow label="Last Updated" value={new Date(employee.updated_at).toLocaleString()} theme={theme} />
        </Card>

        {canUpdate && !isDeleted && (
          <Card style={styles.sectionCard}>
            <View style={styles.toggleRow}>
              <AppText weight="semiBold">{employee.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'}</AppText>
              <Switch
                value={employee.status === 'active'}
                onValueChange={handleToggleStatus}
                trackColor={{ true: theme.colors.primary }}
              />
            </View>
          </Card>
        )}

        {canDelete && (
          <Card style={styles.sectionCard}>
            <AppText
              variant="buttonText"
              color={theme.colors.error}
              weight="semiBold"
              onPress={() => setConfirmAction(isDeleted ? 'restore' : 'delete')}
            >
              {isDeleted ? 'Restore Employee' : 'Delete Employee'}
            </AppText>
          </Card>
        )}
      </ScrollView>

      <ConfirmationDialog
        visible={confirmAction === 'delete'}
        title="Delete Employee"
        message={`Are you sure you want to delete ${fullName}? This can be undone via Restore.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setConfirmAction(null)}
      />
      <ConfirmationDialog
        visible={confirmAction === 'restore'}
        title="Restore Employee"
        message={`Restore ${fullName}? They will need to be reassigned a role separately.`}
        confirmLabel="Restore"
        isLoading={restoreMutation.isPending}
        onConfirm={handleRestore}
        onDismiss={() => setConfirmAction(null)}
      />
    </View>
  );
};

const InfoRow = ({ label, value, theme }: { label: string; value: string; theme: typeof lightTheme }) => (
  <View style={styles.infoRow}>
    <AppText variant="caption" color={theme.colors.textSecondary}>{label}</AppText>
    <AppText>{value}</AppText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: 16, flex: 1 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 6 },
  statusText: { color: '#FFFFFF' },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 12 },
  infoRow: { marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  certRow: { marginBottom: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
