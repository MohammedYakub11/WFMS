import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { RootState } from '../../store';
import { useAuditLogs } from '../../hooks/useAuditLog';
import { AuditLogFilters, AuditLogEntry } from '../../services/auditLog.service';
import { getAuditActionLabel } from '../../utils/auditActionLabels';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { AppHeader } from '../../components/AppHeader';
import { renderAppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { PaginationControls } from '../../components/PaginationControls';
import { SkillTimeline, TimelineEvent } from '../../components/common/SkillTimeline';
import { AuditLogFiltersModal } from '../../components/audit/AuditLogFiltersModal';
import { downloadAndShareExport, ExportFormat } from '../../utils/exportFile';
import { lightTheme, darkTheme } from '../../theme/theme';

const LIMIT = 20;

export const AuditLogsScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const { module, action, userId, dateFrom, dateTo } = useSelector((state: RootState) => state.auditLogFilters);

  const [page, setPage] = useState(1);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const filters: AuditLogFilters = useMemo(
    () => ({
      module: module || undefined,
      action: action || undefined,
      userId: userId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [module, action, userId, dateFrom, dateTo],
  );

  const hasActiveFilters = !!(module || action || userId || dateFrom || dateTo);
  const canExport = hasPermission('EXPORT_REPORTS');

  useEffect(() => {
    setPage(1);
  }, [module, action, userId, dateFrom, dateTo]);

  const { data, isLoading, isError, refetch, isFetching } = useAuditLogs(filters, page, LIMIT);

  const items: AuditLogEntry[] = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const timelineEvents: TimelineEvent[] = items.map((entry) => ({
    id: entry.id,
    title: getAuditActionLabel(entry.action),
    description: `${entry.module} · ${entry.entity}${entry.user ? ' · ' + entry.user.first_name + ' ' + entry.user.last_name : ''}`,
    timestamp: entry.createdAt,
  }));

  const exportMutation = useMutation({
    mutationFn: (format: ExportFormat) =>
      downloadAndShareExport('/audit-logs/export', filters as Record<string, unknown>, format, 'audit-logs'),
    onSuccess: () => {
      showSnackbar('Export ready to share', 'success');
    },
    onError: () => {
      showSnackbar('Failed to export audit logs. Please try again.', 'error');
    },
    onSettled: () => {
      setExportingFormat(null);
    },
  });

  const handleExport = useCallback(
    (format: ExportFormat) => {
      setMenuVisible(false);
      setExportingFormat(format);
      exportMutation.mutate(format);
    },
    [exportMutation],
  );

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Audit Logs"
        showBack
        rightAction={
          <View style={styles.headerActions}>
            <IconButton
              icon={renderAppIcon("filter-variant")}
              onPress={() => setIsFilterVisible(true)}
              accessibilityLabel="Filter audit logs"
              iconColor={hasActiveFilters ? theme.colors.primary : undefined}
            />
            {canExport && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon={renderAppIcon("dots-vertical")}
                    onPress={() => setMenuVisible(true)}
                    accessibilityLabel="More options"
                  />
                }
              >
                <Menu.Item
                  leadingIcon={renderAppIcon("file-delimited-outline")}
                  title={exportingFormat === 'csv' ? 'Exporting CSV…' : 'Export CSV'}
                  disabled={exportMutation.isPending}
                  onPress={() => handleExport('csv')}
                />
                <Menu.Item
                  leadingIcon={renderAppIcon("file-excel-outline")}
                  title={exportingFormat === 'xlsx' ? 'Exporting Excel…' : 'Export Excel'}
                  disabled={exportMutation.isPending}
                  onPress={() => handleExport('xlsx')}
                />
              </Menu>
            )}
          </View>
        }
      />

      {isLoading ? (
        <Loader fullScreen />
      ) : isError ? (
        <EmptyState
          title="Failed to load audit logs"
          description="An error occurred while fetching the audit log. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : timelineEvents.length === 0 ? (
        <EmptyState
          title="No audit log entries found"
          description="Try adjusting your filters to find what you're looking for."
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />}
          >
            <Card style={styles.sectionCard}>
              <AppText variant="h2" style={styles.sectionTitle}>Activity</AppText>
              <SkillTimeline events={timelineEvents} />
            </Card>
          </ScrollView>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
        </>
      )}

      <AuditLogFiltersModal visible={isFilterVisible} onDismiss={() => setIsFilterVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 12 },
});
