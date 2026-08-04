import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';
import { AppText } from './AppText';
import { NeuSurface } from './Cards';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'flat' | 'neu';
}

export const PrimaryButton: React.FC<ButtonProps> = ({
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
    <ActivityIndicator color={theme.colors.primaryButtonText} />
  ) : (
    <AppText variant="buttonText" weight="semiBold" color={variant === 'neu' ? theme.colors.primary : theme.colors.primaryButtonText}>
      {title}
    </AppText>
  );

  if (variant === 'neu') {
    return (
      <NeuSurface
        style={[styles.neuWrapper, style]}
        contentStyle={[styles.neuContent, disabled && styles.disabled]}
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
          backgroundColor: disabled ? theme.colors.statusDisabled : theme.colors.primaryButton,
          borderRadius: theme.radius.m,
        },
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
    alignSelf: 'stretch',
  },
  neuContent: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
