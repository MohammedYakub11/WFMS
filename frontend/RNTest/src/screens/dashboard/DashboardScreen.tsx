import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { AppText } from '../../components/AppText';
import { AppHeader } from '../../components/AppHeader';
import { StatCard, Card } from '../../components/Cards';
import { DashboardChart } from '../../components/DashboardChart';
import { RecentActivityList } from '../../components/RecentActivityList';
import { useDashboardAnalytics, useDashboardSummary } from '../../hooks/useDashboard';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme as theme } from '../../theme/theme';
import { EmptyState } from '../../components/EmptyState';

export const DashboardScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();
  const { data: analytics, refetch: refetchAnalytics } = useDashboardAnalytics();

  const handleRefresh = () => {
    refetch();
    refetchAnalytics();
  };

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

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
      >
        <View style={styles.welcomeSection}>
          <AppText variant="h1">Hello, {user?.first_name || user?.email?.split('@')[0]} 👋</AppText>
          <AppText style={styles.subtitle}>Good Morning! Let's explore today.</AppText>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Employees"
              value={summary.totalEmployees}
              trend={`${summary.employeeTrend.percentage}%`}
              trendPositive={summary.employeeTrend.positive}
            />
            <StatCard
              title="Total Skills"
              value={summary.totalSkills}
              trend={`${summary.skillTrend.percentage}%`}
              trendPositive={summary.skillTrend.positive}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Departments"
              value={summary.departments}
            />
            <StatCard
              title="Open Roles"
              value={summary.openRoles}
            />
          </View>
        </View>

        <Card style={styles.topSkillsCard}>
          <View style={styles.sectionHeader}>
            <AppText variant="h2">Top Skills</AppText>
            <AppText style={styles.viewAll}>View All</AppText>
          </View>
          {(() => {
            const maxSkillCount = Math.max(...summary.topSkills.map((s: { name: string; count: number }) => s.count), 1);
            return summary.topSkills.map((skill: { name: string; count: number }, index: number) => (
              <View key={index} style={styles.skillRow}>
                <AppText style={styles.skillName}>{skill.name}</AppText>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, (skill.count / maxSkillCount) * 100)}%` }]} />
                </View>
                <AppText style={styles.skillCount}>{skill.count}</AppText>
              </View>
            ));
          })()}
        </Card>

        <DashboardChart
          title="Skills by Category"
          data={(analytics?.skillsByCategory ?? []).map((c: { categoryName: string; count: number }) => ({ label: c.categoryName, value: c.count }))}
        />

        <RecentActivityList items={analytics?.recentActivity ?? []} />

        <Card style={styles.completionCard}>
          <View style={styles.completionContent}>
            <View style={styles.completionCircle}>
              <AppText variant="h2" style={{ color: theme.colors.primary }}>{summary.profileCompletion}%</AppText>
            </View>
            <View style={styles.completionText}>
              <AppText style={styles.completionTitle}>Your Profile Completion</AppText>
              <AppText variant="caption" style={styles.completionSubtitle}>Great job! Complete your profile to improve visibility.</AppText>
            </View>
          </View>
        </Card>
      </ScrollView>
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
  },
  topSkillsCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    width: 100,
    fontFamily: theme.typography.fontFamily.medium,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  skillCount: {
    width: 30,
    textAlign: 'right',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  completionCard: {
    backgroundColor: theme.colors.surface,
  },
  completionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  completionText: {
    flex: 1,
  },
  completionTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    marginBottom: 4,
  },
  completionSubtitle: {
    color: theme.colors.textSecondary,
  },
});
