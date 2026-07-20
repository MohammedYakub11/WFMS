import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Role } from '../../types/roles';

interface RoleCardProps {
  role: Role;
  onPress?: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onPress, onEdit, onDelete }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Card style={styles.card} onPress={onPress ? () => onPress(role) : undefined}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AppText variant="h2" numberOfLines={1}>{role.name}</AppText>
          {role.isSystem && (
            <View style={[styles.systemBadge, { backgroundColor: theme.colors.border }]}>
              <AppText variant="caption" color={theme.colors.textSecondary}>System</AppText>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {onEdit && <IconButton icon="pencil" size={20} iconColor={theme.colors.textSecondary} onPress={() => onEdit(role)} />}
          {onDelete && !role.isSystem && (
            <IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={() => onDelete(role)} />
          )}
        </View>
      </View>
      {role.description && (
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.description}>
          {role.description}
        </AppText>
      )}
      <View style={styles.footer}>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          {role.permissionCount ?? 0} permissions
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          {role.employeeCount ?? 0} employees
        </AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  systemBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  actions: { flexDirection: 'row', marginRight: -16 },
  description: { marginTop: 4, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
