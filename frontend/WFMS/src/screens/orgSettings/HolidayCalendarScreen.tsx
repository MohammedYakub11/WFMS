import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { FAB } from 'react-native-paper';
import { AppIcon, renderAppIcon } from '../../components/AppIcon';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { useDeleteHoliday, useHolidays } from '../../hooks/useHolidays';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Holiday } from '../../types/organization';

export const HolidayCalendarScreen = () => {
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');

  const [year, setYear] = useState(new Date().getFullYear());
  const [toDelete, setToDelete] = useState<Holiday | null>(null);

  const query = useMemo(() => ({ year }), [year]);
  const { data, isLoading, isError, refetch, isFetching } = useHolidays(query, 1, 100);
  const deleteMutation = useDeleteHoliday();

  const items = data?.items || [];

  const handleDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        showSnackbar('Holiday deleted', 'success');
        setToDelete(null);
      },
      onError: () => {
        showSnackbar('Failed to delete holiday', 'error');
        setToDelete(null);
      },
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Holiday Calendar" showBack />

      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)} style={styles.yearButton}>
          <AppIcon name="chevron-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h3">{year}</AppText>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)} style={styles.yearButton}>
          <AppIcon name="chevron-right" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Loader fullScreen />
      ) : isError ? (
        <EmptyState title="Failed to load holidays" description="Please try again." actionTitle="Retry" onAction={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No holidays configured" description={`No holidays are set for ${year}.`} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        >
          {items.map((holiday: Holiday) => (
            <Card
              key={holiday.id}
              style={styles.holidayCard}
              onPress={canManage ? () => navigation.navigate('HolidayForm', { holidayId: holiday.id }) : undefined}
            >
              <View style={styles.holidayRow}>
                <View style={styles.holidayInfo}>
                  <AppText weight="semiBold">{holiday.name}</AppText>
                  <AppText variant="caption" color={theme.colors.textSecondary}>
                    {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    {holiday.isRecurring ? ' · Recurring yearly' : ''}
                    {holiday.location ? ` · ${holiday.location.name}` : ' · All locations'}
                  </AppText>
                </View>
                {canManage && (
                  <TouchableOpacity onPress={() => setToDelete(holiday)} style={styles.deleteButton}>
                    <AppIcon name="delete-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {canManage && <FAB icon={renderAppIcon("plus")} style={styles.fab} onPress={() => navigation.navigate('HolidayForm', {})} color="#FFF" />}

      <ConfirmationDialog
        visible={!!toDelete}
        title="Delete Holiday"
        message={`Are you sure you want to delete "${toDelete?.name}"?`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  yearSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, paddingVertical: 12 },
  yearButton: { padding: 8 },
  scrollContent: { padding: 16, paddingBottom: 80 },
  holidayCard: { marginBottom: 12 },
  holidayRow: { flexDirection: 'row', alignItems: 'center' },
  holidayInfo: { flex: 1 },
  deleteButton: { padding: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#22C55E' },
});
