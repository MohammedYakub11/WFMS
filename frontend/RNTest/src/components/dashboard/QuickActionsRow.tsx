import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { AppIcon } from '../AppIcon';
import { NeuIconCircle } from '../Cards';
import { lightTheme as theme } from '../../theme/theme';

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  // Optional count badge (e.g. pending approvals) — omit for actions with nothing to flag.
  badgeCount?: number;
}

interface QuickActionsRowProps {
  actions: QuickAction[];
}

// Generic row of icon+label shortcuts — the same component backs every role's
// "Quick Actions" widget, only the `actions` list passed in differs. Its only
// consumer is the (neumorphic) Dashboard screen, so the icon wrapper is a
// raised Soft UI circle rather than a flat tinted square.
export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity key={action.key} style={styles.action} onPress={action.onPress} activeOpacity={0.7}>
          <NeuIconCircle size={52}>
            <AppIcon name={action.icon} size={22} color={theme.colors.primary} />
            {!!action.badgeCount && action.badgeCount > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{action.badgeCount > 9 ? '9+' : action.badgeCount}</AppText>
              </View>
            )}
          </NeuIconCircle>
          <AppText variant="caption" style={styles.label} numberOfLines={1}>
            {action.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  action: { width: '25%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 16 },
  label: { textAlign: 'center', marginTop: 8 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
