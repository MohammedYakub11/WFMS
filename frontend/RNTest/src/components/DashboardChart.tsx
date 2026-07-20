import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Card } from './Cards';
import { lightTheme as theme } from '../theme/theme';

interface DashboardChartDatum {
  label: string;
  value: number;
}

interface DashboardChartProps {
  title: string;
  data: DashboardChartDatum[];
  emptyLabel?: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ title, data, emptyLabel = 'No data yet' }) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card style={styles.card}>
      <AppText variant="h2" style={styles.title}>{title}</AppText>
      {data.length === 0 ? (
        <AppText style={styles.emptyText}>{emptyLabel}</AppText>
      ) : (
        data.map((datum, index) => (
          <View key={index} style={styles.row}>
            <AppText style={styles.label} numberOfLines={1}>{datum.label}</AppText>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.min(100, (datum.value / maxValue) * 100)}%` }]} />
            </View>
            <AppText style={styles.value}>{datum.value}</AppText>
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
  label: {
    width: 100,
    fontFamily: theme.typography.fontFamily.medium,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  value: {
    width: 30,
    textAlign: 'right',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
