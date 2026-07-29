import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SplashScreen } from '../screens/authentication/SplashScreen';
import { LoginScreen } from '../screens/authentication/LoginScreen';
import { ForgotPasswordScreen } from '../screens/authentication/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/authentication/ResetPasswordScreen';

const Stack = createStackNavigator();

export const AuthStack = () => {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { paddingTop: insets.top } }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

