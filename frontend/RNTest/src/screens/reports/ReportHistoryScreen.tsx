import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppIcon, renderAppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { PaginationControls } from '../../components/PaginationControls';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { usePermissions } from '../../hooks/usePermissions';
import { useDeleteReportHistory, useReportHistory } from '../../hooks/useReports';
import { downloadAndShareExport } from '../../utils/exportFile';
import { REPORT_TYPE_OPTIONS, ReportHistoryEntry } from '../../types/reports';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

const LIMIT = 20;

export const ReportHistoryScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ReportHistoryEntry | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useReportHistory({}, page, LIMIT);
  const deleteMutation = useDeleteReportHistory();

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const handleRedownload = async (entry: ReportHistoryEntry) => {
    setMenuFor(null);
    setRedownloadingId(entry.id);
    try {
      await downloadAndShareExport(`/reports/${entry.id}/download`, { format: entry.format }, entry.format, entry.reportType);
      showSnackbar('Report ready to share', 'success');
    } catch {
      showSnackbar('Failed to download report. Please try again.', 'error');
    } finally {
      setRedownloadingId(null);
    }
  };

  const handleDelete = () => {
    if (!entryToDelete) return;
    deleteMutation.mutate(entryToDelete.id, {
      onSuccess: () => {
        showSnackbar('Report history entry deleted', 'success');
        setEntryToDelete(null);
      },
      onError: () => {
        showSnackbar('Failed to delete entry', 'error');
        setEntryToDelete(null);
      },
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Report History" showBack />

      {isLoading ? (
        <Loader fullScreen />
      ) : isError ? (
        <EmptyState
          title="Failed to load report history"
          description="An error occurred while fetching report history. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState title="No reports generated yet" description="Generate a report to see it appear here." />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          >
            {items.map((entry: ReportHistoryEntry) => {
              const option = REPORT_TYPE_OPTIONS.find((o) => o.type === entry.reportType);
              return (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryRow}>
                    <AppIcon name={option?.icon ?? 'file'} size={24} color={theme.colors.primary} style={styles.entryIcon} />
                    <View style={styles.entryInfo}>
                      <AppText weight="medium" numberOfLines={1}>{option?.label ?? entry.reportType}</AppText>
                      <AppText variant="caption" color={theme.colors.textSecondary}>
                        {entry.format.toUpperCase()} · {new Date(entry.generatedAt).toLocaleString()}
                      </AppText>
                      <AppText variant="caption" color={theme.colors.textSecondary}>
                        {entry.rowCount ?? 0} rows · Downloaded {entry.downloadCount}x
                        {entry.lastDownloadedAt ? ` · Last: ${new Date(entry.lastDownloadedAt).toLocaleDateString()}` : ''}
                      </AppText>
                    </View>
                    <Menu
                      visible={menuFor === entry.id}
                      onDismiss={() => setMenuFor(null)}
                      anchor={
                        <IconButton
                          icon={renderAppIcon("dots-vertical")}
                          onPress={() => setMenuFor(entry.id)}
                          accessibilityLabel="More options"
                        />
                      }
                    >
                      {hasPermission('EXPORT_REPORTS') && (
                        <Menu.Item
                          leadingIcon={renderAppIcon("download")}
                          title={redownloadingId === entry.id ? 'Downloading…' : 'Download Again'}
                          disabled={redownloadingId === entry.id}
                          onPress={() => handleRedownload(entry)}
                        />
                      )}
                      <Menu.Item
                        leadingIcon={renderAppIcon("delete-outline")}
                        title="Delete"
                        onPress={() => {
                          setMenuFor(null);
                          setEntryToDelete(entry);
                        }}
                      />
                    </Menu>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
        </>
      )}

      <ConfirmationDialog
        visible={!!entryToDelete}
        title="Delete Report History"
        message="Are you sure you want to delete this report history entry?"
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setEntryToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  entryCard: { marginBottom: 12 },
  entryRow: { flexDirection: 'row', alignItems: 'center' },
  entryIcon: { marginRight: 12 },
  entryInfo: { flex: 1 },
});
