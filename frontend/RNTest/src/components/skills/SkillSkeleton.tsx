import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';

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
      <Card.Content>
        <View style={styles.header}>
          <Animated.View style={[styles.skeletonLine, styles.titleSkeleton, { opacity }]} />
          <Animated.View style={[styles.skeletonIcon, { opacity }]} />
        </View>
        <View style={styles.categoryRow}>
          <Animated.View style={[styles.skeletonChip, { opacity }]} />
          <Animated.View style={[styles.skeletonChip, { opacity }]} />
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
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonLine: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  titleSkeleton: {
    width: '60%',
    height: 24,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skeletonChip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
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
