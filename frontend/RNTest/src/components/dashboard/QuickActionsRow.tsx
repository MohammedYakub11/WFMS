import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { AppIcon } from '../AppIcon';
import { lightTheme as theme } from '../../theme/theme';

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionsRowProps {
  actions: QuickAction[];
}

// Generic row of icon+label shortcuts — the same component backs every role's
// "Quick Actions" widget, only the `actions` list passed in differs.
export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity key={action.key} style={styles.action} onPress={action.onPress} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <AppIcon name={action.icon} size={22} color={theme.colors.primary} />
          </View>
          <AppText variant="caption" style={styles.label} numberOfLines={1}>
            {action.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, marginHorizontal: -4 },
  action: { width: '25%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 12 },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { textAlign: 'center' },
});
