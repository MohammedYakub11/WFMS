import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { useReportHistory } from '../../hooks/useReports';
import { REPORT_TYPE_OPTIONS, ReportHistoryEntry } from '../../types/reports';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const ReportsDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { data, isLoading } = useReportHistory({}, 1, 5);
  const recentReports = data?.items || [];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Reports"
        showBack
        rightAction={
          <AppText variant="buttonText" color={theme.colors.primary} onPress={() => navigation.navigate('ReportHistory')}>
            History
          </AppText>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText variant="h3" style={styles.sectionTitle}>Report Types</AppText>
        <View style={styles.grid}>
          {REPORT_TYPE_OPTIONS.map((option) => (
            <Card
              key={option.type}
              style={styles.typeCard}
              onPress={() => navigation.navigate('ReportGenerate', { reportType: option.type })}
            >
              <AppText style={styles.typeIcon}>{option.icon}</AppText>
              <AppText variant="cardTitle" weight="semiBold" style={styles.typeLabel}>{option.label}</AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>{option.description}</AppText>
            </Card>
          ))}
        </View>

        <View style={styles.recentHeader}>
          <AppText variant="h3">Recent Reports</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('ReportHistory')}>
            <AppText variant="caption" color={theme.colors.primary}>View All</AppText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Loader />
        ) : recentReports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Generate your first report from a report type above."
            style={styles.emptyState}
          />
        ) : (
          <Card>
            {recentReports.map((entry: ReportHistoryEntry) => {
              const option = REPORT_TYPE_OPTIONS.find((o) => o.type === entry.reportType);
              return (
                <View key={entry.id} style={styles.recentRow}>
                  <AppText style={styles.recentIcon}>{option?.icon ?? '📄'}</AppText>
                  <View style={styles.recentInfo}>
                    <AppText weight="medium">{option?.label ?? entry.reportType}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {entry.format.toUpperCase()} · {new Date(entry.generatedAt).toLocaleDateString()}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 8 },
  typeCard: { width: '47%', marginHorizontal: '1.5%', alignItems: 'flex-start' },
  typeIcon: { fontSize: 28, marginBottom: 8 },
  typeLabel: { marginBottom: 4 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  recentIcon: { fontSize: 20, marginRight: 12 },
  recentInfo: { flex: 1 },
  emptyState: { flex: undefined, paddingVertical: 24 },
});
