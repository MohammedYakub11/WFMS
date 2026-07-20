import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, IconButton, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface SelectionBarProps {
  selectedCount: number;
  totalOnPage: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  onExportSelected?: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedCount,
  totalOnPage,
  allSelected,
  onToggleSelectAll,
  onActivate,
  onDeactivate,
  onDelete,
  onExportSelected,
  onCancel,
  isLoading = false,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.textPrimary,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.selectAllRow}>
          <Checkbox
            status={allSelected && totalOnPage > 0 ? 'checked' : selectedCount > 0 ? 'indeterminate' : 'unchecked'}
            onPress={onToggleSelectAll}
            disabled={isLoading || totalOnPage === 0}
          />
          <AppText variant="body" weight="semiBold">
            {selectedCount} selected
          </AppText>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <IconButton icon="close" size={20} onPress={onCancel} accessibilityLabel="Cancel selection" />
        )}
      </View>

      <View style={[styles.actionsRow, { borderTopColor: theme.colors.divider }]}>
        {onActivate && (
          <IconButton
            icon="check-circle-outline"
            size={22}
            onPress={onActivate}
            disabled={isLoading || selectedCount === 0}
            accessibilityLabel="Activate selected"
          />
        )}
        {onDeactivate && (
          <IconButton
            icon="close-circle-outline"
            size={22}
            onPress={onDeactivate}
            disabled={isLoading || selectedCount === 0}
            accessibilityLabel="Deactivate selected"
          />
        )}
        {onExportSelected && (
          <IconButton
            icon="export-variant"
            size={22}
            onPress={onExportSelected}
            disabled={isLoading || selectedCount === 0}
            accessibilityLabel="Export selected"
          />
        )}
        {onDelete && (
          <IconButton
            icon="delete-outline"
            size={22}
            iconColor={theme.colors.error}
            onPress={onDelete}
            disabled={isLoading || selectedCount === 0}
            accessibilityLabel="Delete selected"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 4,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginRight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
