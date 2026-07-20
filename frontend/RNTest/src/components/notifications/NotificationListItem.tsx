import React, { memo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { AppNotification } from '../../types/notifications';
import { getNotificationTypeMeta } from '../../utils/notificationTypeMeta';

interface NotificationListItemProps {
  notification: AppNotification;
  onPress: () => void;
  onRemove?: () => void;
}

const NotificationListItemComponent: React.FC<NotificationListItemProps> = ({
  notification,
  onPress,
  onRemove,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [expanded, setExpanded] = useState(false);
  const meta = getNotificationTypeMeta(notification.type);

  const handlePress = () => {
    setExpanded((prev) => !prev);
    onPress();
  };

  return (
    <Card
      style={[
        styles.card,
        { borderLeftColor: notification.is_read ? 'transparent' : meta.color },
      ]}
      onPress={handlePress}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.border }]}>
          <AppText style={styles.icon}>{meta.icon}</AppText>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            {!notification.is_read && (
              <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />
            )}
            <AppText
              variant="h2"
              weight={notification.is_read ? 'regular' : 'bold'}
              numberOfLines={1}
              style={styles.titleText}
            >
              {notification.title}
            </AppText>
          </View>
          <AppText
            variant="caption"
            color={theme.colors.textSecondary}
            numberOfLines={expanded ? undefined : 2}
            style={styles.message}
          >
            {notification.message}
          </AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} style={styles.timestamp}>
            {new Date(notification.created_at).toLocaleString()}
          </AppText>
        </View>
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            accessibilityLabel="Remove notification"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText style={[styles.removeIcon, { color: theme.colors.textSecondary }]}>✕</AppText>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  titleText: {
    flex: 1,
  },
  message: {
    lineHeight: 18,
  },
  timestamp: {
    marginTop: 6,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  removeIcon: {
    fontSize: 16,
  },
});

export const NotificationListItem = memo(NotificationListItemComponent);
