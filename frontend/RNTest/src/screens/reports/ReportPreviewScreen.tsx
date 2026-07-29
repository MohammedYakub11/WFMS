import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Menu } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { usePermissions } from '../../hooks/usePermissions';
import { useGenerateAndDownloadReport, usePreviewReport } from '../../hooks/useReports';
import { REPORT_TYPE_OPTIONS, ReportColumnDef, ReportFilters, ReportFormat, ReportType } from '../../types/reports';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const ReportPreviewScreen = () => {
  const route = useRoute<any>();
  const reportType: ReportType = route.params?.reportType;
  const filters: ReportFilters = route.params?.filters || {};
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();

  const previewMutation = usePreviewReport();
  const generateMutation = useGenerateAndDownloadReport();
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    previewMutation.mutate({ reportType, filters });
    // Fires once on mount for this reportType/filters combination — navigating
    // back and re-entering with different params remounts the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const option = REPORT_TYPE_OPTIONS.find((o) => o.type === reportType);
  const preview = previewMutation.data;

  const handleDownload = (format: ReportFormat) => {
    setMenuVisible(false);
    generateMutation.mutate(
      { reportType, format, filters },
      {
        onSuccess: () => showSnackbar('Report ready to share', 'success'),
        onError: () => showSnackbar('Failed to generate report. Please try again.', 'error'),
      },
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={`${option?.label ?? 'Report'} Preview`} showBack />

      {previewMutation.isPending ? (
        <Loader fullScreen />
      ) : previewMutation.isError ? (
        <EmptyState
          title="Failed to load preview"
          description="An error occurred while generating the preview. Please try again."
          actionTitle="Retry"
          onAction={() => previewMutation.mutate({ reportType, filters })}
        />
      ) : !preview || preview.rows.length === 0 ? (
        <EmptyState title="No data found" description="Try adjusting your filters to find results." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AppText variant="caption" color={theme.colors.textSecondary} style={styles.rowCount}>
            {preview.total} row{preview.total === 1 ? '' : 's'} (preview capped at 100)
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={[styles.row, styles.headerRow, { borderColor: theme.colors.border }]}>
                {preview.columns.map((col: ReportColumnDef) => (
                  <AppText key={col.key} weight="semiBold" style={[styles.cell, { width: col.width ? col.width * 7 : 120 }]}>
                    {col.header}
                  </AppText>
                ))}
              </View>
              {preview.rows.map((row: Record<string, unknown>, index: number) => (
                <View key={index} style={[styles.row, { borderColor: theme.colors.border }]}>
                  {preview.columns.map((col: ReportColumnDef) => (
                    <AppText key={col.key} variant="caption" style={[styles.cell, { width: col.width ? col.width * 7 : 120 }]}>
                      {row[col.key] === null || row[col.key] === undefined ? '' : String(row[col.key])}
                    </AppText>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {hasPermission('EXPORT_REPORTS') && preview && preview.rows.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <PrimaryButton
                title={generateMutation.isPending ? 'Generating…' : 'Download'}
                onPress={() => setMenuVisible(true)}
                disabled={generateMutation.isPending}
              />
            }
          >
            <Menu.Item title="Download as CSV" onPress={() => handleDownload('csv')} />
            <Menu.Item title="Download as Excel" onPress={() => handleDownload('xlsx')} />
            <Menu.Item title="Download as PDF" onPress={() => handleDownload('pdf')} />
          </Menu>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  rowCount: { marginBottom: 12 },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1 },
  headerRow: { borderBottomWidth: 2 },
  cell: { paddingHorizontal: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});
