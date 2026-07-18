import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { lightTheme as theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </Container>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendPositive, icon, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.statInfo}>
          <AppText variant="caption" style={styles.statTitle}>{title}</AppText>
          <AppText variant="h2" style={styles.statValue}>{value}</AppText>
        </View>
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <AppText style={[styles.trendText, { color: trendPositive ? theme.colors.success : theme.colors.error }]}>
            {trendPositive ? '↑' : '↓'} {trend}
          </AppText>
          <AppText variant="caption" style={styles.trendSubtitle}> from last month</AppText>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2, // Android shadow
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#16A34A', // Green tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  trendSubtitle: {
    color: '#6B7280',
    marginLeft: 4,
  },
});
