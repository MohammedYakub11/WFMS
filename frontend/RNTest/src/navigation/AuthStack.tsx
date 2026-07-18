import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/authentication/SplashScreen';
import { LoginScreen } from '../screens/authentication/LoginScreen';
import { ForgotPasswordScreen } from '../screens/authentication/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/authentication/ResetPasswordScreen';

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

