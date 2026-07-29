import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface SettingsRow {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  route: string;
}

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

const SECTIONS: SettingsSection[] = [
  {
    title: 'ORGANIZATION STRUCTURE',
    rows: [
      { key: 'profile', label: 'Organization Profile', subtitle: 'Company name, logo, contact info', icon: 'domain', route: 'OrganizationProfile' },
      { key: 'businessUnits', label: 'Business Units', subtitle: 'Manage business units', icon: 'sitemap', route: 'BusinessUnitList' },
      { key: 'departments', label: 'Departments', subtitle: 'Manage departments', icon: 'office-building', route: 'DepartmentList' },
      { key: 'designations', label: 'Designations', subtitle: 'Manage job designations', icon: 'badge-account', route: 'DesignationList' },
      { key: 'locations', label: 'Locations', subtitle: 'Offices, branches, remote locations', icon: 'map-marker', route: 'LocationList' },
      { key: 'holidays', label: 'Holiday Calendar', subtitle: 'Holidays and working days', icon: 'calendar-star', route: 'HolidayCalendar' },
    ],
  },
  {
    title: 'SECURITY & SESSIONS',
    rows: [
      { key: 'passwordPolicy', label: 'Password Policy', subtitle: 'Length, complexity, expiry, lockout', icon: 'lock-outline', route: 'PasswordPolicy' },
      { key: 'sessionSettings', label: 'Session Settings', subtitle: 'Timeouts and concurrent sessions', icon: 'timer-outline', route: 'SessionSettings' },
    ],
  },
  {
    title: 'PREFERENCES',
    rows: [
      { key: 'preferences', label: 'Application Preferences', subtitle: 'Theme, language, date & number formats', icon: 'tune', route: 'Preferences' },
    ],
  },
];

export const OrgSettingsDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={styles.container}>
      <AppHeader title="Organization Settings" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <AppText variant="caption" weight="semiBold" color={theme.colors.textSecondary} style={styles.sectionTitle}>
              {section.title}
            </AppText>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {section.rows.map((row, index) => (
                <TouchableOpacity
                  key={row.key}
                  style={[styles.row, index < section.rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                  onPress={() => navigation.navigate(row.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <AppIcon name={row.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.rowInfo}>
                    <AppText weight="medium">{row.label}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>{row.subtitle}</AppText>
                  </View>
                  <AppIcon name="chevron-right" size={22} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowInfo: { flex: 1 },
});
