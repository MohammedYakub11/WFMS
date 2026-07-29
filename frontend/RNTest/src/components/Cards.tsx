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
  footerAction?: React.ReactNode;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendPositive, icon, footerAction, onPress }) => {
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
          <AppText variant="caption" style={styles.trendSubtitle}>from last month</AppText>
        </View>
      )}
      {footerAction && (
        <View style={styles.footerActionContainer}>
          {footerAction}
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DCFCE7', // Soft green background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statTitle: {
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 28,
    lineHeight: 32,
  },
  trendContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  trendText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  trendSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  footerActionContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
});
