import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { forgotPasswordSchema } from '../../validations/authValidation';
import { useAuthentication } from '../../hooks/useAuthentication';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';

export const ForgotPasswordScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const { forgotPassword, isLoading, error } = useAuthentication();
  const [successMsg, setSuccessMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: any) => {
    setSuccessMsg('');
    const success = await forgotPassword(data);
    if (success) {
      setSuccessMsg('If an account exists, a password reset link has been sent to your email.');
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
            Forgot Password
          </AppText>
          <AppText variant="bodyText" color={theme.colors.textSecondary}>
            Enter your email to receive a reset link
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
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextField
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <PrimaryButton 
            title="Send Reset Link" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={isLoading} 
            style={styles.primaryButton} 
          />
          <SecondaryButton 
            title="Back to Login" 
            onPress={() => navigation.goBack()} 
            disabled={isLoading} 
            style={styles.secondaryButton} 
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
  secondaryButton: {
    marginTop: 16,
  },
  messageBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
});
