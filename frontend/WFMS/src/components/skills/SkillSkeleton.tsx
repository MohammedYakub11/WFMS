import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../Cards';
import { lightTheme as theme } from '../../theme/theme';

const smallChipStyle = { width: 60 };

export const SkillSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonLine, styles.titleSkeleton, { opacity }]} />
        <View style={styles.actions}>
          <Animated.View style={[styles.skeletonIcon, { opacity }]} />
          <Animated.View style={[styles.skeletonIcon, { opacity }]} />
        </View>
      </View>
      <View style={styles.categoryRow}>
        <Animated.View style={[styles.skeletonChip, { opacity }]} />
        <Animated.View style={[styles.skeletonChip, [{ opacity }, smallChipStyle]]} />
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Animated.View style={[styles.skeletonLine, styles.labelSkeleton, { opacity }]} />
          <Animated.View style={[styles.skeletonLine, styles.valueSkeleton, { opacity }]} />
        </View>
        <View style={styles.detailItem}>
          <Animated.View style={[styles.skeletonLine, styles.labelSkeleton, { opacity }]} />
          <Animated.View style={[styles.skeletonLine, styles.valueSkeleton, { opacity }]} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonLine: {
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  titleSkeleton: {
    width: '50%',
    height: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skeletonChip: {
    width: 80,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  labelSkeleton: {
    width: '40%',
    height: 12,
    marginBottom: 8,
  },
  valueSkeleton: {
    width: '80%',
    height: 20,
  },
});
