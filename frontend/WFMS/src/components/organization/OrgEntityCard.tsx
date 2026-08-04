import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { renderAppIcon } from '../AppIcon';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface OrgEntityCardProps {
  title: string;
  subtitle?: string;
  code?: string;
  isActive: boolean;
  isDeleted?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  canManage?: boolean;
}

export const OrgEntityCard: React.FC<OrgEntityCardProps> = ({
  title,
  subtitle,
  code,
  isActive,
  isDeleted,
  onPress,
  onDelete,
  onRestore,
  canManage = true,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <AppText weight="semiBold">{title}</AppText>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: isDeleted ? theme.colors.statusDisabled : isActive ? '#DCFCE7' : '#FEE2E2' },
              ]}
            >
              <AppText variant="caption" color={isDeleted ? theme.colors.textSecondary : isActive ? theme.colors.success : theme.colors.error}>
                {isDeleted ? 'Deleted' : isActive ? 'Active' : 'Inactive'}
              </AppText>
            </View>
          </View>
          {code && (
            <AppText variant="caption" color={theme.colors.textSecondary}>{code}</AppText>
          )}
          {subtitle && (
            <AppText variant="caption" color={theme.colors.textSecondary}>{subtitle}</AppText>
          )}
        </View>
        {canManage && (onDelete || onRestore) && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<IconButton icon={renderAppIcon('dots-vertical')} onPress={() => setMenuVisible(true)} accessibilityLabel="More options" />}
          >
            {onDelete && !isDeleted && (
              <Menu.Item leadingIcon={renderAppIcon('delete-outline')} title="Delete" onPress={() => { setMenuVisible(false); onDelete(); }} />
            )}
            {onRestore && isDeleted && (
              <Menu.Item leadingIcon={renderAppIcon('restore')} title="Restore" onPress={() => { setMenuVisible(false); onRestore(); }} />
            )}
          </Menu>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
});
