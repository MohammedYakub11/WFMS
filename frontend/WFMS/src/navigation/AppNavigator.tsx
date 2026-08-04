import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setAuthTokens, setAuthLoading } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await AsyncStorage.getItem('authState');
        if (authData) {
          const { accessToken, refreshToken, user } = JSON.parse(authData);
          dispatch(setAuthTokens({ accessToken, refreshToken, user }));
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
