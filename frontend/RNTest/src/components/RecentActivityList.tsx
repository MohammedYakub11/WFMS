import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Card, NeuIconCircle } from './Cards';
import { lightTheme as theme } from '../theme/theme';
import { DashboardActivityItem } from '../types/dashboard';

interface RecentActivityListProps {
  items: DashboardActivityItem[];
  emptyLabel?: string;
  // 'flat' (default) preserves the original card everywhere it's used today.
  // 'neu' opts into the raised Soft UI card for the neumorphic Dashboard.
  variant?: 'flat' | 'neu';
}

const formatTimeAgo = (isoTimestamp: string): string => {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const statusColor = (status?: string): string => {
  switch (status) {
    case 'approved':
      return theme.colors.statusApproved;
    case 'rejected':
      return theme.colors.statusRejected;
    case 'changes_requested':
      return theme.colors.statusPending;
    default:
      return theme.colors.textSecondary;
  }
};

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ items, emptyLabel = 'No recent activity', variant = 'flat' }) => {
  const isNeu = variant === 'neu';

  return (
    <Card style={styles.card} variant={variant}>
      <AppText variant="h2" style={styles.title}>Recent Activity</AppText>
      {items.length === 0 ? (
        <AppText style={styles.emptyText}>{emptyLabel}</AppText>
      ) : (
        items.map((item, index) => (
          <View key={index} style={[styles.row, isNeu && styles.rowNeu]}>
            {isNeu ? (
              <NeuIconCircle size={32} style={styles.dotIconNeu}>
                <View style={[styles.dotSmall, { backgroundColor: statusColor(item.status) }]} />
              </NeuIconCircle>
            ) : (
              <View style={[styles.dot, { backgroundColor: statusColor(item.status) }]} />
            )}
            <View style={styles.textContainer}>
              <AppText style={styles.itemTitle} numberOfLines={1}>{item.title}</AppText>
              {item.subtitle && (
                <AppText variant="caption" style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</AppText>
              )}
            </View>
            <AppText variant="caption" style={styles.timestamp}>{formatTimeAgo(item.timestamp)}</AppText>
          </View>
        ))
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  rowNeu: {
    marginBottom: 16,
  },
  dotIconNeu: {
    marginRight: 12,
  },
  dotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: theme.typography.fontFamily.medium,
  },
  itemSubtitle: {
    color: theme.colors.textSecondary,
  },
  timestamp: {
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
});
