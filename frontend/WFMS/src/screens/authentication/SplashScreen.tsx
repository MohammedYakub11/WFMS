import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { AppText } from '../../components/AppText';
import { Loader } from '../../components/Loader';
import { useNavigation } from '@react-navigation/native';

export const SplashScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppText variant="splashTitle" weight="bold" color={theme.colors.primary} style={styles.title}>
        WFMS
      </AppText>
      <Loader size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
  },
});
