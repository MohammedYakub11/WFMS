import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { Avatar } from '../Avatar';
import { renderAppIcon } from '../AppIcon';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { EmployeeListItem } from '../../types/employees';

interface EmployeeCardProps {
  employee: EmployeeListItem;
  onPress?: (employee: EmployeeListItem) => void;
  onEdit?: (employee: EmployeeListItem) => void;
}

const getStatusColor = (status: string, theme: typeof lightTheme) =>
  status === 'active' ? theme.colors.statusActive : theme.colors.statusDisabled;

const EmployeeCardComponent: React.FC<EmployeeCardProps> = ({ employee, onPress, onEdit }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const fullName = `${employee.first_name} ${employee.last_name}`;
  const statusColor = getStatusColor(employee.status, theme);

  return (
    <Card style={styles.card} onPress={onPress ? () => onPress(employee) : undefined}>
      <View style={styles.header}>
        <Avatar name={fullName} uri={employee.profile_image} size={44} />
        <View style={styles.titleContainer}>
          <AppText variant="h2" numberOfLines={1}>{fullName}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
            {employee.designation || 'No designation'}
          </AppText>
        </View>
        {onEdit && (
          <IconButton icon={renderAppIcon("pencil")} size={20} iconColor={theme.colors.textSecondary} onPress={() => onEdit(employee)} />
        )}
      </View>

      <View style={styles.metaRow}>
        {employee.department && (
          <Chip style={[styles.chip, { backgroundColor: theme.colors.border }]} textStyle={{ color: theme.colors.textSecondary, fontSize: 12 }} compact>
            {employee.department}
          </Chip>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <AppText variant="caption" style={styles.statusText}>
            {employee.status === 'active' ? 'Active' : 'Inactive'}
          </AppText>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.divider }]}>
        <AppText variant="caption" color={theme.colors.textSecondary}>{employee.employee_code}</AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>{employee.location || '—'}</AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chip: {},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
  },
});

export const EmployeeCard = memo(EmployeeCardComponent);
