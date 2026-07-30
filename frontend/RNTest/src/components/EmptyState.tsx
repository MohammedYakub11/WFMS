import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { lightTheme as theme } from '../theme/theme';
import { NeuIconCircle, NEU_BACKGROUND } from './Cards';
import { AppIcon } from './AppIcon';

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
        <NeuIconCircle size={80} style={styles.iconContainer}>
          <AppIcon name="inbox" size={40} color={theme.colors.textSecondary} />
        </NeuIconCircle>
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
    backgroundColor: NEU_BACKGROUND,
  },
  iconContainer: {
    marginBottom: 24,
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
