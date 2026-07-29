import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useEmployeeProfile } from '../../hooks/useEmployee';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card, StatCard } from '../../components/Cards';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Loader } from '../../components/Loader';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface InfoRowProps {
  label: string;
  value: string;
  theme: typeof lightTheme;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, theme }) => (
  <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
    <AppText variant="caption" color={theme.colors.textSecondary}>{label}</AppText>
    <AppText weight="medium">{value}</AppText>
  </View>
);

export const EmployeePreviewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { employeeId, employeeData } = route.params;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { data: fullEmployeeData, isLoading } = useEmployeeProfile(employeeId);
  const employee = fullEmployeeData?.data || employeeData;

  const loading = isLoading && !employeeData?.employeeSkills; // Show loading if no fallback data

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Employee Profile" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  const primarySkills: string[] = employee.primarySkills || [];

  return (
    <View style={styles.container}>
      <AppHeader title="Employee Profile" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Avatar
            name={`${employee.first_name || ''} ${employee.last_name || ''}`}
            uri={employee.profile_image}
            size={88}
            style={styles.avatar}
          />
          <AppText variant="h2" weight="semiBold" align="center">
            {employee.first_name} {employee.last_name}
          </AppText>
          <AppText color={theme.colors.textSecondary} align="center" style={styles.designation}>
            {employee.designation || 'No Designation'}
          </AppText>
          {employee.employee_code && (
            <AppText variant="caption" color={theme.colors.textSecondary} align="center">
              Employee ID: {employee.employee_code}
            </AppText>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Employment Information</AppText>
          <InfoRow label="Department" value={employee.department || 'N/A'} theme={theme} />
          <InfoRow label="Location" value={employee.location || 'N/A'} theme={theme} />
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Skills Summary</AppText>
          <View style={styles.statsRow}>
            <StatCard title="Total Skills" value={employee.totalSkills ?? 0} />
            <StatCard title="Certifications" value={employee.certificationsCount ?? 0} />
            <StatCard title="Avg. Proficiency" value={employee.averageProficiency ?? 0} />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="h3" style={styles.sectionTitle}>Skills</AppText>
          {primarySkills.length > 0 ? (
            <View style={styles.chipRow}>
              {primarySkills.map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: theme.colors.selectedChip }]}>
                  <AppText variant="caption" weight="medium">{skill}</AppText>
                </View>
              ))}
            </View>
          ) : (
            <AppText color={theme.colors.textSecondary}>No skills available.</AppText>
          )}
        </Card>

        {employee.email && (
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Contact Information</AppText>
            <InfoRow label="Email" value={employee.email} theme={theme} />
          </Card>
        )}

        <View style={styles.footer}>
          <PrimaryButton
            title="View Full Profile"
            onPress={() => navigation.navigate('EmployeeDetails', { employeeId })}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: { marginBottom: 16 },
  designation: { marginTop: 4, marginBottom: 8 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  footer: { marginTop: 8 },
});
