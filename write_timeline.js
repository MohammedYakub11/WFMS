const fs = require('fs');
const dir = 'C:\\WFMS\\frontend\\MyApp\\src\\components\\common';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const timelineComponent = `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: string;
  color?: string;
  user?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline = React.memo(({ events }: TimelineProps) => {
  const theme = useTheme();

  if (!events || events.length === 0) {
    return <Text style={styles.emptyText}>No events to display</Text>;
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        
        return (
          <View key={event.id} style={styles.eventContainer}>
            <View style={styles.indicatorContainer}>
              <Avatar.Icon 
                size={32} 
                icon={event.icon || "circle-medium"} 
                style={{ backgroundColor: event.color || theme.colors.primary }}
                color={theme.colors.onPrimary}
              />
              {!isLast && <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />}
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{event.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>
              {event.user && (
                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                  by {event.user}
                </Text>
              )}
              {event.description && (
                <Text variant="bodyMedium" style={styles.description}>
                  {event.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
    color: '#888',
  },
  eventContainer: {
    flexDirection: 'row',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    marginTop: 4,
  },
});
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\common\\Timeline.tsx', timelineComponent);
console.log('Successfully wrote Timeline.tsx');
