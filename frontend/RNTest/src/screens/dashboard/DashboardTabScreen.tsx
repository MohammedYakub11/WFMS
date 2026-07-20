import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from './DashboardScreen';
import { AdminOverviewBanner } from '../../components/dashboard/AdminOverviewBanner';
import { usePermissions } from '../../hooks/usePermissions';

// Wraps the protected DashboardScreen (never modified directly) with an additive,
// Administrator-only banner — safe because DashboardScreen's own root is already
// {flex:1}, so nesting it inside a flex:1 sibling container doesn't alter its
// internal rendering at all.
export const DashboardTabScreen = () => {
  const { isAdministrator } = usePermissions();

  return (
    <View style={styles.container}>
      {isAdministrator && <AdminOverviewBanner />}
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
