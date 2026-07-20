import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card, StatCard } from '../../components/Cards';
import { DashboardChart } from '../../components/DashboardChart';
import { RecentActivityList } from '../../components/RecentActivityList';
import { useDashboardSummary, useDashboardAnalytics } from '../../hooks/useDashboard';
import { useRoles } from '../../hooks/useRoles';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { ApprovalBreakdownItem, CategoryBreakdownItem } from '../../types/dashboard';
import { Role } from '../../types/roles';

// Org-wide administrator view — reuses the existing Dashboard's live data (already
// org-wide, not "my") plus the role catalog, so no new backend endpoint is needed.
export const AdminOverviewScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useDashboardAnalytics();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();

  const isLoading = isLoadingSummary || isLoadingAnalytics || isLoadingRoles;

  const pendingApprovals =
    analytics?.approvalStatusBreakdown?.find((a: ApprovalBreakdownItem) => a.status === 'pending')?.count ?? 0;

  return (
    <View style={styles.container}>
      <AppHeader title="Admin Overview" showBack />
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsRow}>
            <StatCard title="Total Employees" value={summary?.totalEmployees ?? 0} />
            <StatCard title="Roles" value={roles?.length ?? 0} />
            <StatCard title="Pending Approvals" value={pendingApprovals} />
          </View>

          <DashboardChart
            title="Skills by Category"
            data={(analytics?.skillsByCategory ?? []).map((c: CategoryBreakdownItem) => ({ label: c.categoryName, value: c.count }))}
          />

          <DashboardChart
            title="Approval Status Breakdown"
            data={(analytics?.approvalStatusBreakdown ?? []).map((a: ApprovalBreakdownItem) => ({ label: a.status, value: a.count }))}
          />

          <Card style={styles.rolesCard}>
            <AppText variant="h2" style={styles.rolesTitle}>Roles</AppText>
            {(roles ?? []).map((role: Role) => (
              <View key={role.id} style={styles.roleRow}>
                <AppText>{role.name}</AppText>
                <AppText color={theme.colors.textSecondary}>{role.employeeCount ?? 0} employees</AppText>
              </View>
            ))}
          </Card>

          <RecentActivityList items={analytics?.recentActivity ?? []} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 24 },
  rolesCard: { marginBottom: 24 },
  rolesTitle: { marginBottom: 12 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
