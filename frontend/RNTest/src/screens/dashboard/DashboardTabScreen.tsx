import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from './DashboardScreen';

export const DashboardTabScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.dashboardContainer}>
        <DashboardScreen />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  dashboardContainer: { flex: 1 },
});
