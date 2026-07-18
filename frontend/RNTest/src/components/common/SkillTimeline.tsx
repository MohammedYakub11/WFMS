import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: string;
  color?: string;
}

export const SkillTimeline = ({ events }: { events: TimelineEvent[] }) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <View key={event.id} style={styles.eventContainer}>
          <View style={[styles.dot, { backgroundColor: event.color || theme.colors.primary }]} />
          <View style={styles.content}>
            <Text variant="titleMedium">{event.title}</Text>
            {event.description ? <Text variant="bodyMedium">{event.description}</Text> : null}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {new Date(event.timestamp).toLocaleString()}
            </Text>
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
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
});
