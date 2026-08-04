import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const NotificationSkeleton = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  const bg = { backgroundColor: theme.colors.border };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Animated.View style={[styles.iconCircle, bg, { opacity }]} />
        <View style={styles.body}>
          <Animated.View style={[styles.line, styles.titleLine, bg, { opacity }]} />
          <Animated.View style={[styles.line, styles.messageLine, bg, { opacity }]} />
          <Animated.View style={[styles.line, styles.timestampLine, bg, { opacity }]} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  body: { flex: 1 },
  line: { borderRadius: 4, marginBottom: 6 },
  titleLine: { width: '60%', height: 16 },
  messageLine: { width: '90%', height: 12 },
  timestampLine: { width: '30%', height: 10, marginBottom: 0 },
});
