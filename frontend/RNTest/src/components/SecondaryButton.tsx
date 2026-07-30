import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';
import { AppText } from './AppText';
import { ButtonProps } from './PrimaryButton';
import { NeuSurface } from './Cards';

interface SecondaryButtonProps extends ButtonProps {
  // 'flat' (default) is the original flat-fill button used everywhere today.
  // 'neu' renders it as a softly raised Soft UI pill — opt-in only, used by
  // the neumorphic Dashboard's "View Profile" action.
  variant?: 'flat' | 'neu';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  variant = 'neu',
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const label = isLoading ? (
    <ActivityIndicator color={theme.colors.primary} />
  ) : (
    <AppText variant="buttonText" weight="semiBold" color={theme.colors.primary}>
      {title}
    </AppText>
  );

  if (variant === 'neu') {
    return (
      <NeuSurface
        style={[styles.neuWrapper, style]}
        contentStyle={styles.neuContent}
        radius={theme.radius.round}
        onPress={disabled || isLoading ? undefined : onPress}
      >
        {label}
      </NeuSurface>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.secondaryButton,
          borderRadius: theme.radius.m,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {label}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.6,
  },
  neuWrapper: {
    alignSelf: 'flex-start',
  },
  neuContent: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
