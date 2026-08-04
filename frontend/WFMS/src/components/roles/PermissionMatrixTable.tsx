import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Permission, Role } from '../../types/roles';
import { useIsWideLayout } from '../../utils/responsive';

interface PermissionMatrixTableProps {
  permissions: Permission[];
  roles: Role[];
  onToggle: (roleId: string, permissionCode: string, checked: boolean) => void;
  readonly?: boolean;
}

export const PermissionMatrixTable: React.FC<PermissionMatrixTableProps> = ({
  permissions,
  roles,
  onToggle,
  readonly = false,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const isWideLayout = useIsWideLayout();
  const columnWidth = isWideLayout ? 160 : 120;

  const hasPermission = (role: Role, code: string) => (role.permissions || []).some((p) => p.code === code);

  const groups: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={[styles.headerRow, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.labelCell, { width: isWideLayout ? 240 : 160 }]} />
          {roles.map((role) => (
            <View key={role.id} style={[styles.roleCell, { width: columnWidth }]}>
              <AppText variant="tableText" weight="semiBold" numberOfLines={2} align="center">
                {role.name}
              </AppText>
            </View>
          ))}
        </View>

        {Object.entries(groups).map(([category, categoryPermissions]) => (
          <View key={category}>
            <View style={[styles.categoryRow, { backgroundColor: theme.colors.border }]}>
              <AppText variant="caption" weight="semiBold">{category}</AppText>
            </View>
            {categoryPermissions.map((permission) => (
              <View key={permission.id} style={[styles.dataRow, { borderBottomColor: theme.colors.divider }]}>
                <View style={[styles.labelCell, { width: isWideLayout ? 240 : 160 }]}>
                  <AppText variant="tableText" numberOfLines={1}>{permission.name}</AppText>
                </View>
                {roles.map((role) => (
                  <View key={role.id} style={[styles.roleCell, { width: columnWidth }]}>
                    <Checkbox
                      status={hasPermission(role, permission.code) ? 'checked' : 'unchecked'}
                      disabled={readonly}
                      onPress={() => onToggle(role.id, permission.code, !hasPermission(role, permission.code))}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8 },
  labelCell: { justifyContent: 'center', paddingHorizontal: 8 },
  roleCell: { alignItems: 'center', justifyContent: 'center' },
  categoryRow: { paddingHorizontal: 8, paddingVertical: 6 },
  dataRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, minHeight: 44 },
});
