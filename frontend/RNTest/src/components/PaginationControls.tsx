import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { NeuSurface, NEU_BACKGROUND } from './Cards';
import { lightTheme as theme } from '../theme/theme';

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
  const canGoPrev = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  return (
    <View style={styles.container}>
      <NeuSurface
        radius={theme.radius.l}
        style={styles.buttonWrapper}
        contentStyle={styles.button}
        onPress={canGoPrev ? () => onPageChange(page - 1) : undefined}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        accessibilityState={{ disabled: !canGoPrev }}
      >
        <AppText
          variant="buttonText"
          weight="semiBold"
          color={canGoPrev ? theme.colors.primary : theme.colors.textSecondary}
          style={!canGoPrev && styles.disabledText}
        >
          Prev
        </AppText>
      </NeuSurface>

      <AppText variant="caption" color={theme.colors.textSecondary}>
        Page {page} of {Math.max(totalPages, 1)}
      </AppText>

      <NeuSurface
        radius={theme.radius.l}
        style={styles.buttonWrapper}
        contentStyle={styles.button}
        onPress={canGoNext ? () => onPageChange(page + 1) : undefined}
        accessibilityRole="button"
        accessibilityLabel="Next page"
        accessibilityState={{ disabled: !canGoNext }}
      >
        <AppText
          variant="buttonText"
          weight="semiBold"
          color={canGoNext ? theme.colors.primary : theme.colors.textSecondary}
          style={!canGoNext && styles.disabledText}
        >
          Next
        </AppText>
      </NeuSurface>
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
    backgroundColor: NEU_BACKGROUND,
  },
  buttonWrapper: {
    // Guarantees the ≥44dp minimum touch target regardless of the "Prev"/
    // "Next" label's own text metrics.
    minWidth: 44,
    minHeight: 44,
  },
  button: {
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    opacity: 0.5,
  },
});
