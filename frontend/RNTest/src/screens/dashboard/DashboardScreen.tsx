import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { AppText } from '../../components/AppText';
import { AppHeader } from '../../components/AppHeader';
import { StatCard, Card } from '../../components/Cards';
import { AppIcon } from '../../components/AppIcon';
import { Avatar } from '../../components/Avatar';
import { SecondaryButton } from '../../components/SecondaryButton';
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
import { useEmployeeProfile } from '../../hooks/useEmployee';
import { useDashboardVisibility } from '../../hooks/useDashboardVisibility';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme as theme } from '../../theme/theme';
import { EmptyState } from '../../components/EmptyState';
import { NEU_BACKGROUND } from '../../components/Cards';
import {
  ApprovalBreakdownItem,
  CategoryBreakdownItem,
  DepartmentKpi,
  SkillGapItem,
  TopSkill,
  DepartmentDesignationCount,
  LocationCount,
  MonthlyCount,
} from '../../types/dashboard';

const formatMonthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const DashboardScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const visibility = useDashboardVisibility();

  const { data: summary, isLoading, error, refetch } = useDashboardSummary();
  const { data: profile } = useEmployeeProfile(user?.id || '');
  const { data: analytics, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useDashboardAnalytics(visibility.canViewAnalytics);
  const { data: departmentKpis, isLoading: isLoadingDepartmentKpis } = useDepartmentKpis(visibility.showTeamOverview);
  const { data: workforceDistribution, isLoading: isLoadingWorkforceDistribution } = useWorkforceDistribution(
    visibility.showAvailability || visibility.showResourceAllocation,
  );
  const { data: skillGap, isLoading: isLoadingSkillGap } = useSkillGapAnalysis(visibility.showResourceAnalytics);
  // Reuses the same VIEW_ANALYTICS-gated trends endpoint the Workforce Manager's
  // "Team Analytics" widget already calls — extended to Administrator too so the
  // neumorphic "Skills Trend" chart (matching the reference design) has real
  // data for the role the reference was designed around. Administrator already
  // holds VIEW_ANALYTICS, so this doesn't grant any new access.
  const showSkillsTrend = visibility.canViewAnalytics;
  const { data: trends, isLoading: isLoadingTrends } = useAnalyticsTrends(showSkillsTrend);

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
    analytics?.approvalStatusBreakdown?.find((a: ApprovalBreakdownItem) => a.status === 'pending')?.count ?? 0;

  const pendingApprovalsAction: QuickAction | null = visibility.showPendingApprovals
    ? {
        key: 'pending-approvals',
        label: 'Pending Approvals',
        icon: 'clipboard-text-outline',
        onPress: () => navigation.navigate('PendingApprovals'),
        badgeCount: pendingApprovals,
      }
    : null;

  const quickActions: QuickAction[] = visibility.showMySkills
    ? [
        { key: 'add-skill', label: 'Add Skill', icon: 'plus', onPress: () => navigation.navigate('Skills') },
        { key: 'view-profile', label: 'My Skills', icon: 'code-tags', onPress: () => navigation.navigate('Skills') },
        { key: 'search-workforce', label: 'Skill Search', icon: 'magnify', onPress: () => navigation.navigate('Search') },
        ...(pendingApprovalsAction ? [pendingApprovalsAction] : []),
        { key: 'notifications', label: 'Notifications', icon: 'bell-outline', onPress: () => navigation.navigate('Notifications') },
      ]
    : [
        ...(visibility.showSearchWorkforce
          ? [{ key: 'search-workforce', label: 'Search Workforce', icon: 'magnify', onPress: () => navigation.navigate('Search') }]
          : []),
        ...(pendingApprovalsAction ? [pendingApprovalsAction] : []),
        ...(visibility.showReportsShortcut
          ? [{ key: 'reports', label: 'Reports', icon: 'file-chart-outline', onPress: () => navigation.navigate('ReportsDashboard') }]
          : []),
        ...(visibility.showUserManagementShortcut
          ? [{ key: 'user-management', label: 'User Management', icon: 'account-cog', onPress: () => navigation.navigate('RoleManagement') }]
          : []),
        { key: 'notifications', label: 'Notifications', icon: 'bell-outline', onPress: () => navigation.navigate('Notifications') },
      ];

  const displayName = profile?.first_name || user?.first_name
    ? `${profile?.first_name || user?.first_name}${profile?.last_name || user?.last_name ? ` ${profile?.last_name || user?.last_name}` : ''}`
    : user?.email?.split('@')[0] || 'there';

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
        (showSkillsTrend && isLoadingTrends));

    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        >
          {/* Welcome / profile summary */}
          <Card style={styles.welcomeCard} variant="neu">
            <View style={styles.welcomeRow}>
              <Avatar
                name={displayName}
                uri={profile?.profile_image}
                size={64}
                style={styles.welcomeAvatar}
              />
              <View style={styles.welcomeInfo}>
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.greetingText}>
                  {getGreeting()}, 👋
                </AppText>
                {/* The employee name must never truncate — autoSize shrinks
                    the font to fit a single line first, and only wraps to a
                    2nd line as a last resort for an exceptionally long name. */}
                <AppText variant="h1" autoSize minFontScale={0.55} style={styles.nameText}>
                  {displayName}
                </AppText>
                {!!(profile?.designation) && (
                  <AppText color={theme.colors.textSecondary} numberOfLines={1}>{profile.designation}</AppText>
                )}
                {(profile?.department || profile?.employee_code) && (
                  <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={styles.welcomeMeta}>
                    {profile?.department}
                    {profile?.department && profile?.employee_code ? '  •  ' : ''}
                    {profile?.employee_code ? `Employee ID: ${profile.employee_code}` : ''}
                  </AppText>
                )}
              </View>
            </View>
            <SecondaryButton
              title="View Profile  ›"
              onPress={() => navigation.navigate('Profile')}
              variant="neu"
              style={styles.viewProfileButton}
            />
          </Card>

          {/* Statistics */}
          {visibility.showOrgSummary && (
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  layout="centered"
                  variant="neu"
                  title="Total Employees"
                  value={summary.totalEmployees}
                  trend={`${summary.employeeTrend.percentage}%`}
                  trendPositive={summary.employeeTrend.positive}
                  icon={<AppIcon name="account-group" size={26} color={theme.colors.primary} />}
                />
                <StatCard
                  layout="centered"
                  variant="neu"
                  title="Total Skills"
                  value={summary.totalSkills}
                  trend={`${summary.skillTrend.percentage}%`}
                  trendPositive={summary.skillTrend.positive}
                  icon={<AppIcon name="code-tags" size={26} color={theme.colors.primary} />}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  layout="centered"
                  variant="neu"
                  title="Departments"
                  value={summary.departments}
                  icon={<AppIcon name="office-building" size={26} color={theme.colors.primary} />}
                />
                <StatCard
                  layout="centered"
                  variant="neu"
                  title="Pending Approvals"
                  value={pendingApprovals}
                  icon={<AppIcon name="clipboard-text-outline" size={26} color={theme.colors.primary} />}
                  onPress={() => navigation.navigate('PendingApprovals')}
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
                layout="centered"
                variant="neu"
                title="Profile Completion"
                value={`${summary.profileCompletion}%`}
                icon={<AppIcon name="badge-account" size={26} color={theme.colors.primary} />}
                onPress={() => navigation.navigate('Profile')}
              />
              <StatCard
                layout="centered"
                variant="neu"
                title="Notifications"
                value={summary.notificationCount}
                icon={<AppIcon name="bell-outline" size={26} color={theme.colors.primary} />}
                onPress={() => navigation.navigate('Notifications')}
              />
            </View>
          )}

          {/* Quick Actions */}
          <Card style={styles.sectionCard} variant="neu">
            <AppText variant="h2" style={styles.sectionTitle}>Quick Actions</AppText>
            <QuickActionsRow actions={quickActions} />
          </Card>

          {analyticsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {visibility.showSkillsDistribution && (
                <DashboardChart
                  title="Skills Overview"
                  variant="donut"
                  cardVariant="neu"
                  centerLabel="Total Skills"
                  actionLabel="View All"
                  onActionPress={() => navigation.navigate('Skills')}
                  data={(analytics?.skillsByCategory ?? []).map((c: CategoryBreakdownItem) => ({ label: c.categoryName, value: c.count }))}
                />
              )}

              {showSkillsTrend && (
                <DashboardChart
                  title="Skills Trend"
                  variant="line"
                  cardVariant="neu"
                  emptyLabel="No skill submissions yet"
                  data={(trends?.skillSubmissions ?? []).map((m: MonthlyCount) => ({ label: formatMonthLabel(m.month), value: m.count }))}
                />
              )}

              {visibility.canViewAnalytics && (summary.topSkills ?? []).length > 0 && (
                <Card style={styles.sectionCard} variant="neu">
                  <View style={styles.headerRow}>
                    <AppText variant="h2">Top Skills in Org</AppText>
                    <AppText
                      variant="caption"
                      color={theme.colors.primary}
                      style={styles.viewAllSmall}
                      onPress={() => navigation.navigate('Skills')}
                    >
                      View All ›
                    </AppText>
                  </View>
                  {summary.topSkills.map((skill: TopSkill) => (
                    <View key={skill.name} style={styles.topSkillRow}>
                      <View style={styles.topSkillIcon}>
                        <AppIcon name="code-tags" size={16} color={theme.colors.primary} />
                      </View>
                      <AppText style={styles.topSkillLabel} numberOfLines={1}>{skill.name}</AppText>
                      <AppText style={styles.topSkillValue}>{skill.count}</AppText>
                    </View>
                  ))}
                </Card>
              )}

              {visibility.showTeamOverview && (
                <Card style={styles.sectionCard} variant="neu">
                  <AppText variant="h2" style={styles.sectionTitle}>Team Overview</AppText>
                  {(departmentKpis ?? []).length === 0 ? (
                    <AppText color={theme.colors.textSecondary}>No data yet</AppText>
                  ) : (
                    (departmentKpis ?? []).map((item: DepartmentKpi) => (
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
                  cardVariant="neu"
                  data={(workforceDistribution?.byDepartmentDesignation ?? []).map((d: DepartmentDesignationCount) => ({ label: `${d.department} — ${d.designation}`, value: d.count }))}
                />
              )}

              {visibility.showResourceAllocation && (
                <StatCard
                  layout="centered"
                  variant="neu"
                  title="Available Resources"
                  value={summary.totalEmployees}
                  icon={<AppIcon name="account-multiple-check" size={26} color={theme.colors.primary} />}
                />
              )}

              {visibility.showAvailability && (
                <DashboardChart
                  title={visibility.showTeamOverview ? 'Workforce Availability' : 'Team Distribution'}
                  cardVariant="neu"
                  data={(workforceDistribution?.byLocation ?? []).map((l: LocationCount) => ({ label: l.location, value: l.count }))}
                />
              )}

              {visibility.showResourceAnalytics && (
                <DashboardChart
                  title="Resource Analytics"
                  cardVariant="neu"
                  data={(skillGap ?? []).map((g: SkillGapItem) => ({ label: g.categoryName, value: Math.round(g.belowProficiencyPct) }))}
                  emptyLabel="No skill gap data yet"
                />
              )}

              {visibility.showRecentActivity && (
                <RecentActivityList items={analytics?.recentActivity ?? []} variant="neu" />
              )}
            </>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* App branding removed — redundant after login; the dashboard starts
          directly with the drawer/notification/avatar action icons. */}
      <AppHeader showDrawer showNotification variant="neu" />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEU_BACKGROUND,
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
  welcomeCard: {
    marginBottom: 24,
  },
  welcomeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  welcomeAvatar: {
    marginRight: 16,
  },
  welcomeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeMeta: {
    marginTop: 2,
  },
  // Greeting is intentionally the lightest-weight line in the block — the
  // employee name (nameText, below) is the primary focus.
  greetingText: {
    marginBottom: 2,
  },
  nameText: {
    marginBottom: 2,
  },
  viewProfileButton: {
    alignSelf: 'flex-start',
  },
  statsGrid: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllSmall: {
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  topSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topSkillIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.secondaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topSkillLabel: {
    flex: 1,
  },
  topSkillValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  kpiRow: {
    marginBottom: 12,
  },
  kpiDepartment: {
    marginBottom: 2,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
