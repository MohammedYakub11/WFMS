import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../../validations/authValidation';
import { useAuthentication } from '../../hooks/useAuthentication';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { PasswordField } from '../../components/PasswordField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

export const ResetPasswordScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const { resetPassword, isLoading, error } = useAuthentication();
  const [successMsg, setSuccessMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      token: '', // In a real app, this might come from deep linking params
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: any) => {
    setSuccessMsg('');
    const success = await resetPassword(data);
    if (success) {
      setSuccessMsg('Password has been successfully reset. You can now login.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <AppText variant="screenTitle" weight="bold" style={styles.title}>
            Reset Password
          </AppText>
          <AppText variant="bodyText" color={theme.colors.textSecondary}>
            Create a new password for your account
          </AppText>
        </View>

        {error && (
          <View style={[styles.messageBox, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
            <AppText variant="caption" color={theme.colors.error}>{error}</AppText>
          </View>
        )}

        {successMsg ? (
          <View style={[styles.messageBox, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}>
            <AppText variant="caption" color={theme.colors.success}>{successMsg}</AppText>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextField
                label="Reset Token"
                placeholder="Enter reset token"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.token?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="New Password"
                placeholder="Enter new password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="Confirm Password"
                placeholder="Confirm your new password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <PrimaryButton 
            title="Reset Password" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={isLoading} 
            style={styles.primaryButton} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  primaryButton: {
    marginTop: 24,
  },
  messageBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
});
