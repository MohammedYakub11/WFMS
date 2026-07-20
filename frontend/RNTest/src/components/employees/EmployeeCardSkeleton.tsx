import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

export const EmployeeCardSkeleton = () => {
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
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, bg, { opacity }]} />
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.line, styles.titleLine, bg, { opacity }]} />
          <Animated.View style={[styles.line, styles.subtitleLine, bg, { opacity }]} />
        </View>
      </View>
      <View style={styles.metaRow}>
        <Animated.View style={[styles.chip, bg, { opacity }]} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  titleContainer: { flex: 1, marginLeft: 12 },
  line: { borderRadius: 4, marginBottom: 6 },
  titleLine: { width: '60%', height: 18 },
  subtitleLine: { width: '40%', height: 14 },
  metaRow: { flexDirection: 'row' },
  chip: { width: 80, height: 24, borderRadius: 12 },
});
