import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { AppText } from './AppText';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const canGoPrev = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        accessibilityState={{ disabled: !canGoPrev }}
        disabled={!canGoPrev}
        onPress={() => onPageChange(page - 1)}
        style={[styles.button, { borderColor: theme.colors.border }, !canGoPrev && styles.disabled]}
      >
        <AppText variant="caption" color={theme.colors.textPrimary}>Prev</AppText>
      </TouchableOpacity>

      <AppText variant="caption" color={theme.colors.textSecondary}>
        Page {page} of {Math.max(totalPages, 1)}
      </AppText>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Next page"
        accessibilityState={{ disabled: !canGoNext }}
        disabled={!canGoNext}
        onPress={() => onPageChange(page + 1)}
        style={[styles.button, { borderColor: theme.colors.border }, !canGoNext && styles.disabled]}
      >
        <AppText variant="caption" color={theme.colors.textPrimary}>Next</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});
