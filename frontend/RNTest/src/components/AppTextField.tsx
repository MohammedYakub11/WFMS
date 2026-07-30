import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';
import { AppText } from './AppText';

export interface AppTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const AppTextField: React.FC<AppTextFieldProps> = ({
  label,
  error,
  rightIcon,
  style,
  ...rest
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: '#EAEFF5', // subtle inset dark background relative to NEU_BACKGROUND
            borderColor: error ? theme.colors.error : 'rgba(0,0,0,0.05)',
            borderTopColor: error ? theme.colors.error : 'rgba(0,0,0,0.1)',
            borderLeftColor: error ? theme.colors.error : 'rgba(0,0,0,0.1)',
            borderRadius: theme.radius.m,
          },
          style,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: theme.typography.fontSize.bodyText,
            },
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          {...rest}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0, // important for Android
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
  },
});
