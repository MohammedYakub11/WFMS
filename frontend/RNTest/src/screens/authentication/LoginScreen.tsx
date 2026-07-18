import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../validations/authValidation';
import { useAuthentication } from '../../hooks/useAuthentication';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { PasswordField } from '../../components/PasswordField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

export const LoginScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const { login, isLoading, error } = useAuthentication();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    await login(data);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <AppText variant="screenTitle" weight="bold" style={styles.title}>
            Welcome Back
          </AppText>
          <AppText variant="bodyText" color={theme.colors.textSecondary}>
            Login to your account to continue
          </AppText>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
            <AppText variant="caption" color={theme.colors.error}>{error}</AppText>
          </View>
        )}

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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
            <AppText variant="bodyText" weight="medium" color={theme.colors.primary}>
              Forgot Password?
            </AppText>
          </TouchableOpacity>

          <PrimaryButton 
            title="Login" 
            onPress={handleSubmit(onSubmit)} 
            isLoading={isLoading} 
            style={styles.loginButton} 
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 16,
  },
  errorBox: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
});
