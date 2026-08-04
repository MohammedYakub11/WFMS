import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { lightTheme, darkTheme } from '../theme/theme';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'large', color, style, fullScreen = false }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const loaderColor = color || theme.colors.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }, style]}>
        <ActivityIndicator size={size} color={loaderColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={loaderColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
