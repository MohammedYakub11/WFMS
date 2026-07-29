import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { MySkillsSummary } from '../../types/dashboard';
import { lightTheme as theme } from '../../theme/theme';

interface MySkillsCardProps {
  summary: MySkillsSummary;
}

// Employee's personal skill breakdown — reused wherever "My Skills" needs to render.
export const MySkillsCard: React.FC<MySkillsCardProps> = ({ summary }) => {
  const rows: Array<{ label: string; value: number; color: string }> = [
    { label: 'Approved', value: summary.approved, color: theme.colors.statusApproved },
    { label: 'Pending', value: summary.pending, color: theme.colors.statusPending },
    { label: 'Rejected / Changes Requested', value: summary.rejected + summary.changesRequested, color: theme.colors.statusRejected },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="h2">My Skills</AppText>
        <AppText variant="h2" style={{ color: theme.colors.primary }}>
          {summary.completionPercentage}%
        </AppText>
      </View>
      <AppText variant="caption" style={styles.subtitle}>
        {summary.total} total submitted
      </AppText>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: row.color }]} />
          <AppText style={styles.rowLabel}>{row.label}</AppText>
          <AppText style={styles.rowValue}>{row.value}</AppText>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitle: { color: theme.colors.textSecondary, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  rowLabel: { flex: 1 },
  rowValue: { fontFamily: theme.typography.fontFamily.semiBold },
});
