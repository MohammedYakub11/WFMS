import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { lightTheme as theme } from '../theme/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <View style={styles.iconContainer}>
          <AppText style={styles.icon}>📭</AppText>
        </View>
      )}
      <AppText variant="h2" style={styles.title}>{title}</AppText>
      <AppText style={styles.description}>{description}</AppText>
      
      {actionTitle && onAction && (
        <PrimaryButton 
          title={actionTitle} 
          onPress={onAction} 
          style={styles.actionButton} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    minWidth: 160,
  },
});
