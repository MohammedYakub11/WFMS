import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

// Slim tap-through banner shown above the (untouched) DashboardScreen for Administrators.
export const AdminOverviewBanner = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Card style={styles.card} onPress={() => navigation.navigate('AdminOverview')}>
      <AppText weight="semiBold">Admin Overview</AppText>
      <AppText variant="caption" color={theme.colors.textSecondary}>
        Org-wide headcount, roles, and pending approvals →
      </AppText>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: -8,
  },
});
