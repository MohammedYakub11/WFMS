import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '../../components/AppText';
import { AppHeader } from '../../components/AppHeader';
import { StatCard, Card } from '../../components/Cards';
import { AppIcon } from '../../components/AppIcon';
import { useNavigation } from '@react-navigation/native';
import { DashboardChart } from '../../components/DashboardChart';
import { RecentActivityList } from '../../components/RecentActivityList';
import { MySkillsCard } from '../../components/dashboard/MySkillsCard';
import { QuickActionsRow, QuickAction } from '../../components/dashboard/QuickActionsRow';
import {
  useDashboardSummary,
  useDashboardAnalytics,
  useDepartmentKpis,
  useSkillGapAnalysis,
  useWorkforceDistribution,
  useAnalyticsTrends,
} from '../../hooks/useDashboard';
import { useDashboardVisibility } from '../../hooks/useDashboardVisibility';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme as theme } from '../../theme/theme';
import { EmptyState } from '../../components/EmptyState';

const formatMonthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

export const DashboardScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const visibility = useDashboardVisibility();

  const { data: summary, isLoading, error, refetch } = useDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useDashboardAnalytics(visibility.canViewAnalytics);
  const { data: departmentKpis, isLoading: isLoadingDepartmentKpis } = useDepartmentKpis(visibility.showTeamOverview);
  const { data: workforceDistribution, isLoading: isLoadingWorkforceDistribution } = useWorkforceDistribution(
    visibility.showAvailability || visibility.showResourceAllocation,
  );
  const { data: skillGap, isLoading: isLoadingSkillGap } = useSkillGapAnalysis(visibility.showResourceAnalytics);
  const { data: trends, isLoading: isLoadingTrends } = useAnalyticsTrends(visibility.showTeamAnalytics);

  useEffect(() => {
    if (!isLoading && summary) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, summary, fadeAnim]);

  const handleRefresh = () => {
    refetch();
    if (visibility.canViewAnalytics) refetchAnalytics();
  };

  const pendingApprovals =
    analytics?.approvalStatusBreakdown?.find((a) => a.status === 'pending')?.count ?? 0;

  const quickActions: QuickAction[] = visibility.showMySkills
    ? [
        { key: 'add-skill', label: 'Add Skill', icon: 'plus', onPress: () => navigation.navigate('Skills') },
        { key: 'view-profile', label: 'View Profile', icon: 'badge-account', onPress: () => navigation.navigate('Profile') },
        { key: 'notifications', label: 'Notifications', icon: 'bell-outline', onPress: () => navigation.navigate('Notifications') },
      ]
    : [
        ...(visibility.showSearchWorkforce
          ? [{ key: 'search-workforce', label: 'Search Workforce', icon: 'magnify', onPress: () => navigation.navigate('Search') }]
          : []),
        ...(visibility.showReportsShortcut
          ? [{ key: 'reports', label: 'Reports', icon: 'file-chart-outline', onPress: () => navigation.navigate('ReportsDashboard') }]
          : []),
        ...(visibility.showUserManagementShortcut
          ? [{ key: 'user-management', label: 'User Management', icon: 'account-cog', onPress: () => navigation.navigate('RoleManagement') }]
          : []),
        { key: 'notifications', label: 'Notifications', icon: 'bell-outline', onPress: () => navigation.navigate('Notifications') },
      ];

  const renderContent = () => {
    if (isLoading && !summary) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error || !summary) {
      return (
        <EmptyState
          title="Unable to load dashboard"
          description="We couldn't fetch the dashboard data. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      );
    }

    const analyticsLoading =
      visibility.canViewAnalytics &&
      (isLoadingAnalytics ||
        (visibility.showTeamOverview && isLoadingDepartmentKpis) ||
        ((visibility.showAvailability || visibility.showResourceAllocation) && isLoadingWorkforceDistribution) ||
        (visibility.showResourceAnalytics && isLoadingSkillGap) ||
        (visibility.showTeamAnalytics && isLoadingTrends));

    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        >
          <View style={styles.welcomeSection}>
            <AppText variant="h1">Hello, {user?.first_name || user?.email?.split('@')[0]} 👋</AppText>
            <AppText style={styles.subtitle}>Good Morning! Let's explore today.</AppText>
          </View>

          {visibility.showOrgSummary && (
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  title="Total Employees"
                  value={summary.totalEmployees}
                  trend={`${summary.employeeTrend.percentage}%`}
                  trendPositive={summary.employeeTrend.positive}
                  icon={<AppIcon name="account-group" size={28} color="#16A34A" />}
                />
                <StatCard
                  title="Total Skills"
                  value={summary.totalSkills}
                  trend={`${summary.skillTrend.percentage}%`}
                  trendPositive={summary.skillTrend.positive}
                  icon={<AppIcon name="code-tags" size={28} color="#16A34A" />}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Departments"
                  value={summary.departments}
                  icon={<AppIcon name="office-building" size={28} color="#16A34A" />}
                />
                <StatCard
                  title="Skill Categories"
                  value={analytics?.skillsByCategory?.length ?? 0}
                  icon={<AppIcon name="clipboard-text-outline" size={28} color="#16A34A" />}
                  footerAction={
                    <TouchableOpacity onPress={() => navigation.navigate('Skills')} activeOpacity={0.7}>
                      <AppText style={styles.viewAllSmall}>View all</AppText>
                    </TouchableOpacity>
                  }
                />
              </View>
            </View>
          )}

          {visibility.showMySkills && summary.mySkills && (
            <MySkillsCard summary={summary.mySkills} />
          )}

          {visibility.showMySkills && (
            <View style={styles.statsRow}>
              <StatCard
                title="Profile Completion"
                value={`${summary.profileCompletion}%`}
                icon={<AppIcon name="badge-account" size={28} color="#16A34A" />}
                footerAction={
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
                    <AppText style={styles.viewAllSmall}>Complete now</AppText>
                  </TouchableOpacity>
                }
              />
              <StatCard
                title="Notifications"
                value={summary.notificationCount}
                icon={<AppIcon name="bell-outline" size={28} color="#16A34A" />}
              />
            </View>
          )}

          {analyticsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {visibility.showTeamOverview && (
                <Card style={styles.sectionCard}>
                  <AppText variant="h2" style={styles.sectionTitle}>Team Overview</AppText>
                  {(departmentKpis ?? []).length === 0 ? (
                    <AppText color={theme.colors.textSecondary}>No data yet</AppText>
                  ) : (
                    (departmentKpis ?? []).map((item) => (
                      <View key={item.department} style={styles.kpiRow}>
                        <AppText style={styles.kpiDepartment}>{item.department}</AppText>
                        <AppText variant="caption" color={theme.colors.textSecondary}>
                          {item.headcount} people · {item.avgExperience} yrs avg exp
                        </AppText>
                      </View>
                    ))
                  )}
                </Card>
              )}

              {visibility.showResourceAllocation && (
                <DashboardChart
                  title="Resource Allocation"
                  data={(workforceDistribution?.byDepartmentDesignation ?? []).map((d) => ({ label: `${d.department} — ${d.designation}`, value: d.count }))}
                />
              )}

              {visibility.showPendingApprovals && (
                <View style={styles.statsRow}>
                  <StatCard
                    title="Pending Approvals"
                    value={pendingApprovals}
                    icon={<AppIcon name="clipboard-text-outline" size={28} color="#16A34A" />}
                  />
                  {visibility.showResourceAllocation && (
                    <StatCard
                      title="Available Resources"
                      value={summary.totalEmployees}
                      icon={<AppIcon name="account-multiple-check" size={28} color="#16A34A" />}
                    />
                  )}
                </View>
              )}

              {visibility.showSkillsDistribution && (
                <DashboardChart
                  title={
                    visibility.showTeamOverview
                      ? 'Team Skills'
                      : visibility.showResourceAllocation
                      ? 'Skill Availability'
                      : 'Workforce Analytics'
                  }
                  data={(analytics?.skillsByCategory ?? []).map((c) => ({ label: c.categoryName, value: c.count }))}
                />
              )}

              {visibility.showAvailability && (
                <DashboardChart
                  title={visibility.showTeamOverview ? 'Workforce Availability' : 'Team Distribution'}
                  data={(workforceDistribution?.byLocation ?? []).map((l) => ({ label: l.location, value: l.count }))}
                />
              )}

              {visibility.showResourceAnalytics && (
                <DashboardChart
                  title="Resource Analytics"
                  data={(skillGap ?? []).map((g) => ({ label: g.categoryName, value: Math.round(g.belowProficiencyPct) }))}
                  emptyLabel="No skill gap data yet"
                />
              )}

              {visibility.showTeamAnalytics && (
                <DashboardChart
                  title="Team Analytics"
                  data={(trends?.employeeGrowth ?? []).map((m) => ({ label: formatMonthLabel(m.month), value: m.count }))}
                />
              )}

              {visibility.showRecentActivity && (
                <RecentActivityList items={analytics?.recentActivity ?? []} />
              )}
            </>
          )}

          <Card style={styles.sectionCard}>
            <AppText variant="h2" style={styles.sectionTitle}>Quick Actions</AppText>
            <QuickActionsRow actions={quickActions} />
          </Card>
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader showDrawer showNotification />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  viewAllSmall: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  kpiRow: {
    marginBottom: 12,
  },
  kpiDepartment: {
    marginBottom: 2,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
