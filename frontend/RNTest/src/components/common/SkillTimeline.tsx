import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { lightTheme as theme } from '../../theme/theme';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: string;
  color?: string;
}

// Shared timeline row — used by Audit Logs, Employee Details, and Employee
// Skill Details. Previously rendered via react-native-paper's raw <Text>/
// useTheme() (Paper's generic Material palette, not this app's theme), which
// is why text contrast here didn't match the rest of the app.
export const SkillTimeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <View style={styles.container}>
      {events.map((event) => (
        <View key={event.id} style={styles.eventContainer}>
          <View style={styles.dotColumn}>
            <View style={[styles.dot, { backgroundColor: event.color || theme.colors.primary }]} />
          </View>
          <View style={styles.content}>
            <AppText variant="cardTitle" weight="semiBold" numberOfLines={2}>
              {event.title}
            </AppText>
            {event.description ? (
              <AppText variant="body" color={theme.colors.textSecondary} style={styles.description} numberOfLines={2}>
                {event.description}
              </AppText>
            ) : null}
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.timestamp}>
              {new Date(event.timestamp).toLocaleString()}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dotColumn: {
    width: 12,
    alignItems: 'center',
    marginRight: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  timestamp: {
    marginTop: 4,
  },
});
