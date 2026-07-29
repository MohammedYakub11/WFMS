import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card, StatCard } from '../../components/Cards';
import { DashboardChart } from '../../components/DashboardChart';
import { RecentActivityList } from '../../components/RecentActivityList';
import {
  useDashboardSummary,
  useDashboardAnalytics,
  useDepartmentKpis,
  useSkillGapAnalysis,
  useCertificationAnalytics,
  useApprovalsAnalytics,
  useWorkforceDistribution,
  useAnalyticsTrends,
} from '../../hooks/useDashboard';
import { useRoles } from '../../hooks/useRoles';
import { setFilters } from '../../store/employeeDirectorySlice';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import {
  ApprovalBreakdownItem,
  CategoryBreakdownItem,
  DepartmentKpi,
  SkillGapItem,
  IssuingOrganizationCount,
  TopReviewer,
  LocationCount,
  DepartmentDesignationCount,
  MonthlyCount,
} from '../../types/dashboard';
import { Role } from '../../types/roles';

const formatMonthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

// Org-wide administrator view — reuses the existing Dashboard's live data (already
// org-wide, not "my") plus the role catalog and the analytics endpoints added for
// department KPIs, skill gaps, certifications, approvals, workforce distribution and trends.
export const AdminOverviewScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useDashboardAnalytics();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: departmentKpis, isLoading: isLoadingDepartmentKpis } = useDepartmentKpis();
  const { data: skillGap, isLoading: isLoadingSkillGap } = useSkillGapAnalysis();
  const { data: certifications, isLoading: isLoadingCertifications } = useCertificationAnalytics();
  const { data: approvalsAnalytics, isLoading: isLoadingApprovalsAnalytics } = useApprovalsAnalytics();
  const { data: workforceDistribution, isLoading: isLoadingWorkforceDistribution } = useWorkforceDistribution();
  const { data: trends, isLoading: isLoadingTrends } = useAnalyticsTrends();

  const isLoading =
    isLoadingSummary ||
    isLoadingAnalytics ||
    isLoadingRoles ||
    isLoadingDepartmentKpis ||
    isLoadingSkillGap ||
    isLoadingCertifications ||
    isLoadingApprovalsAnalytics ||
    isLoadingWorkforceDistribution ||
    isLoadingTrends;

  const pendingApprovals =
    analytics?.approvalStatusBreakdown?.find((a: ApprovalBreakdownItem) => a.status === 'pending')?.count ?? 0;

  const handleDepartmentPress = (item: DepartmentKpi) => {
    dispatch(setFilters({ department: item.department }));
    navigation.navigate('EmployeeDirectory');
  };

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

          <View style={styles.statsRow}>
            <StatCard title="Avg Review Time" value={`${(approvalsAnalytics?.avgReviewHours ?? 0).toFixed(1)}h`} />
          </View>

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Top Reviewers</AppText>
            {(approvalsAnalytics?.topReviewers ?? []).length === 0 ? (
              <AppText color={theme.colors.textSecondary}>No data yet</AppText>
            ) : (
              (approvalsAnalytics?.topReviewers ?? []).map((reviewer: TopReviewer) => (
                <View key={reviewer.employeeId} style={styles.rowBetween}>
                  <AppText>{reviewer.name}</AppText>
                  <AppText color={theme.colors.textSecondary}>{reviewer.count}</AppText>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.rolesCard}>
            <AppText variant="h2" style={styles.rolesTitle}>Roles</AppText>
            {(roles ?? []).map((role: Role) => (
              <View key={role.id} style={styles.roleRow}>
                <AppText>{role.name}</AppText>
                <AppText color={theme.colors.textSecondary}>{role.employeeCount ?? 0} employees</AppText>
              </View>
            ))}
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Department KPIs</AppText>
            {(departmentKpis ?? []).length === 0 ? (
              <AppText color={theme.colors.textSecondary}>No data yet</AppText>
            ) : (
              (departmentKpis ?? []).map((item: DepartmentKpi) => (
                <TouchableOpacity key={item.department} style={styles.kpiRow} onPress={() => handleDepartmentPress(item)}>
                  <AppText style={styles.kpiDepartment}>{item.department}</AppText>
                  <AppText color={theme.colors.textSecondary}>
                    {item.headcount} · {item.avgExperience} yrs exp · {item.approvedSkillCount} skills · {item.avgProficiency} avg
                  </AppText>
                </TouchableOpacity>
              ))
            )}
          </Card>

          <DashboardChart
            title="Skill Gap — % Below Proficiency 3"
            data={(skillGap ?? []).map((g: SkillGapItem) => ({ label: g.categoryName, value: Math.round(g.belowProficiencyPct) }))}
          />

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Certification Gaps</AppText>
            {(skillGap ?? []).length === 0 ? (
              <AppText color={theme.colors.textSecondary}>No data yet</AppText>
            ) : (
              (skillGap ?? []).map((item: SkillGapItem) => (
                <View key={item.categoryName} style={styles.rowBetween}>
                  <AppText>{item.categoryName}</AppText>
                  <AppText color={theme.colors.textSecondary}>{item.certificationGapCount} gaps</AppText>
                </View>
              ))
            )}
          </Card>

          <View style={styles.statsRow}>
            <StatCard title="Certified" value={certifications?.certifiedCount ?? 0} />
            <StatCard title="Not Certified" value={certifications?.notCertifiedCount ?? 0} />
            <StatCard title="Expiring in 90 Days" value={certifications?.expiringSoonCount ?? 0} />
          </View>

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Top Issuing Organizations</AppText>
            {(certifications?.topIssuingOrganizations ?? []).length === 0 ? (
              <AppText color={theme.colors.textSecondary}>No data yet</AppText>
            ) : (
              (certifications?.topIssuingOrganizations ?? []).map((org: IssuingOrganizationCount) => (
                <View key={org.name} style={styles.rowBetween}>
                  <AppText>{org.name}</AppText>
                  <AppText color={theme.colors.textSecondary}>{org.count}</AppText>
                </View>
              ))
            )}
          </Card>

          <DashboardChart
            title="Workforce by Location"
            data={(workforceDistribution?.byLocation ?? []).map((l: LocationCount) => ({ label: l.location, value: l.count }))}
          />

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Workforce by Department &amp; Designation</AppText>
            {(workforceDistribution?.byDepartmentDesignation ?? []).length === 0 ? (
              <AppText color={theme.colors.textSecondary}>No data yet</AppText>
            ) : (
              (workforceDistribution?.byDepartmentDesignation ?? []).map((item: DepartmentDesignationCount, index: number) => (
                <View key={`${item.department}-${item.designation}-${index}`} style={styles.rowBetween}>
                  <AppText numberOfLines={1} style={styles.flexShrink}>{item.department} — {item.designation}</AppText>
                  <AppText color={theme.colors.textSecondary}>{item.count}</AppText>
                </View>
              ))
            )}
          </Card>

          <DashboardChart
            title="Employee Growth (6mo)"
            data={(trends?.employeeGrowth ?? []).map((m: MonthlyCount) => ({ label: formatMonthLabel(m.month), value: m.count }))}
          />

          <DashboardChart
            title="Skill Submissions (6mo)"
            data={(trends?.skillSubmissions ?? []).map((m: MonthlyCount) => ({ label: formatMonthLabel(m.month), value: m.count }))}
          />

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
  sectionCard: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kpiRow: { marginBottom: 12 },
  kpiDepartment: { marginBottom: 2, fontWeight: '600' },
  flexShrink: { flexShrink: 1, marginRight: 8 },
});
